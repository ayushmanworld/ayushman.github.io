import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../src/prisma/prisma.service'
import { Resend } from 'resend'
import * as crypto from 'crypto'
import Razorpay from 'razorpay'

@Injectable()
export class DonationsService {
  private readonly logger = new Logger(DonationsService.name)
  private readonly razorpay: Razorpay
  private readonly resend: Resend

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.config.get('RAZORPAY_KEY_ID') as string,
      key_secret: this.config.get('RAZORPAY_KEY_SECRET') as string,
    })
    this.resend = new Resend(this.config.get('RESEND_API_KEY'))
  }

  async createOrder(dto: CreateOrderDto) {
    const amountPaise = Math.round(dto.amount * 100)

    const order = await this.razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `AYU-${Date.now()}`,
      notes: {
        donorName: dto.donorName,
        donorEmail: dto.donorEmail,
        cause: dto.cause || 'GENERAL',
        country: dto.country,
        state: dto.state || '',
      },
    })

    // Create pending donation record
    const donation = await this.prisma.donation.create({
      data: {
        donorName: dto.donorName,
        donorEmail: dto.donorEmail,
        donorPhone: dto.donorPhone,
        amount: amountPaise,
        currency: 'INR',
        cause: (dto.cause as any) || 'GENERAL',
        razorpayOrderId: order.id,
        status: 'PENDING',
        country: dto.country,
        state: dto.state,
        city: dto.city,
        message: dto.message,
        userId: dto.userId,
      },
    })

    return {
      orderId: order.id,
      amount: amountPaise,
      currency: 'INR',
      donationId: donation.id,
      keyId: this.config.get('RAZORPAY_KEY_ID'),
    }
  }

  async verifyPayment(dto: VerifyPaymentDto) {
    // Verify Razorpay signature
    const expectedSig = crypto
      .createHmac('sha256', this.config.get('RAZORPAY_KEY_SECRET') as string)
      .update(`${dto.orderId}|${dto.paymentId}`)
      .digest('hex')

    if (expectedSig !== dto.signature) {
      throw new BadRequestException('Invalid payment signature')
    }

    // Update donation
    const donation = await this.prisma.donation.update({
      where: { razorpayOrderId: dto.orderId },
      data: {
        razorpayPaymentId: dto.paymentId,
        razorpaySignature: dto.signature,
        status: 'COMPLETED',
        receiptNumber: this.generateReceiptNumber(),
      },
    })

    // Update location stats
    await this.updateLocationStats(donation.country, donation.state, donation.city)

    // Send 80G receipt email
    await this.send80GReceipt(donation)

    this.logger.log(`✅ Donation verified: ${donation.id} — ₹${donation.amount / 100}`)

    return {
      success: true,
      donationId: donation.id,
      receiptNumber: donation.receiptNumber,
      amount: donation.amount / 100,
    }
  }

  private async updateLocationStats(country?: string | null, state?: string | null, city?: string | null) {
    if (!country) return
    await this.prisma.donationLocationStat.upsert({
      where: { country_state_city: { country: country || '', state: state || '', city: city || '' } },
      update: { count: { increment: 1 } },
      create: { country: country || '', state: state || '', city: city || '', count: 1 },
    })
  }

  private generateReceiptNumber(): string {
    const year = new Date().getFullYear()
    const rand = Math.floor(10000 + Math.random() * 90000)
    return `AYU-${year}-${rand}`
  }

  private async send80GReceipt(donation: any) {
    try {
      const amountINR = (donation.amount / 100).toLocaleString('en-IN')
      await this.resend.emails.send({
        from: 'Ayushman NGO <receipts@ayushman.world>',
        to: donation.donorEmail,
        subject: `Donation Receipt — ₹${amountINR} | ${donation.receiptNumber}`,
        html: `
          <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #FDF9F4;">
            <div style="text-align:center; margin-bottom: 30px;">
              <h1 style="font-family: Georgia, serif; color: #1E2D3D; font-size: 28px; margin-bottom: 4px;">Ayushman</h1>
              <p style="color: #C8782A; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Empowering Abilities. Enriching Lives.</p>
            </div>

            <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #DDD6C8; margin-bottom: 24px;">
              <h2 style="font-family: Georgia, serif; color: #1E2D3D; font-size: 22px; margin-bottom: 20px;">Thank you, ${donation.donorName}! 💛</h2>
              <p style="color: #6B5D50; font-size: 15px; line-height: 1.8; margin-bottom: 20px;">Your generous donation has been received and will directly fund therapy and education for children with autism and ADHD who cannot afford it.</p>

              <table style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="border-bottom: 1px solid #DDD6C8;">
                  <td style="padding: 10px 0; color: #6B5D50; font-size: 13px;">Receipt Number</td>
                  <td style="padding: 10px 0; color: #1E2D3D; font-weight: 700; text-align: right;">${donation.receiptNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #DDD6C8;">
                  <td style="padding: 10px 0; color: #6B5D50; font-size: 13px;">Amount Donated</td>
                  <td style="padding: 10px 0; color: #1E2D3D; font-weight: 700; text-align: right; font-size: 18px;">₹${amountINR}</td>
                </tr>
                <tr style="border-bottom: 1px solid #DDD6C8;">
                  <td style="padding: 10px 0; color: #6B5D50; font-size: 13px;">Designated For</td>
                  <td style="padding: 10px 0; color: #1E2D3D; font-weight: 600; text-align: right;">${donation.cause}</td>
                </tr>
                <tr style="border-bottom: 1px solid #DDD6C8;">
                  <td style="padding: 10px 0; color: #6B5D50; font-size: 13px;">Payment ID</td>
                  <td style="padding: 10px 0; color: #1E2D3D; font-family: monospace; text-align: right; font-size: 12px;">${donation.razorpayPaymentId}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6B5D50; font-size: 13px;">Date</td>
                  <td style="padding: 10px 0; color: #1E2D3D; font-weight: 600; text-align: right;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                </tr>
              </table>

              <div style="background: #E0F0EC; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <p style="color: #2D7A6B; font-size: 13px; font-weight: 700; margin-bottom: 4px;">🔍 Your Donor Tracking ID: <strong>${donation.id}</strong></p>
                <p style="color: #2D7A6B; font-size: 12px;">Use this ID to track how your donation is being used in our monthly transparency reports at <a href="https://ayushman.world/transparency" style="color: #2D7A6B;">ayushman.world/transparency</a></p>
              </div>

              <div style="background: #FBF0DC; border-radius: 12px; padding: 16px;">
                <p style="color: #C8782A; font-size: 13px; font-weight: 700; margin-bottom: 4px;">🏛️ Section 80G Tax Deduction</p>
                <p style="color: #4A3728; font-size: 12px;">This donation is eligible for tax deduction under Section 80G of the Income Tax Act, 1961. Please keep this email as your proof of donation. Our 80G registration number will be shared in a follow-up email.</p>
              </div>
            </div>

            <p style="text-align: center; color: #6B5D50; font-size: 13px; line-height: 1.8;">Questions? Contact us at <a href="mailto:ayushmans@outlook.in" style="color: #C8782A;">ayushmans@outlook.in</a> or +91 82800 56665</p>
            <p style="text-align: center; color: #C8782A; font-size: 12px; margin-top: 20px;">Made with ♥ for Ayushman — and every extraordinary child like him</p>
          </div>
        `,
      })

      await this.prisma.donation.update({
        where: { id: donation.id },
        data: { receiptSentAt: new Date() },
      })
      this.logger.log(`📧 80G receipt sent to ${donation.donorEmail}`)
    } catch (err) {
      this.logger.error(`Failed to send receipt to ${donation.donorEmail}:`, err)
    }
  }

  async getPublicStats() {
    const [total, locationStats, recent] = await Promise.all([
      this.prisma.donation.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.donationLocationStat.findMany({
        orderBy: { count: 'desc' },
        take: 20,
      }),
      this.prisma.donation.findMany({
        where: { status: 'COMPLETED', isAnonymous: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          donorName: true, amount: true, cause: true,
          country: true, state: true, createdAt: true,
        },
      }),
    ])

    return {
      totalRaised: (total._sum.amount || 0) / 100,
      totalDonors: total._count,
      locationStats,
      recentDonations: recent.map((d) => ({
        ...d,
        amount: d.amount / 100,
      })),
    }
  }
}

interface CreateOrderDto {
  amount: number
  cause?: string
  donorName: string
  donorEmail: string
  donorPhone?: string
  country: string
  state?: string
  city?: string
  message?: string
  userId?: string
}

interface VerifyPaymentDto {
  orderId: string
  paymentId: string
  signature: string
}
