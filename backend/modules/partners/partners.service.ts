import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../src/prisma/prisma.service'
import { Resend } from 'resend'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class PartnersService {
  private readonly logger = new Logger(PartnersService.name)
  private readonly resend: Resend

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.resend = new Resend(this.config.get('RESEND_API_KEY'))
  }

  async register(dto: any, userId: string) {
    const regId = `REG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`

    const partner = await this.prisma.partner.create({
      data: {
        ...dto,
        userId,
        registrationId: regId,
        status: 'PENDING',
        isVisible: false,
      },
    })

    // Notify founder
    await this.notifyFounder(partner)

    // Confirm to partner
    await this.confirmToPartner(partner)

    this.logger.log(`New partner registration: ${partner.orgName} (${regId})`)

    return {
      registrationId: regId,
      partnerId: partner.id,
      status: 'PENDING',
      message: 'Registration received. Ayushman will contact you within 24–48 hours for verification.',
    }
  }

  async approve(partnerId: string, approverId: string) {
    const partner = await this.prisma.partner.findUnique({ where: { id: partnerId } })
    if (!partner) throw new NotFoundException('Partner not found')

    // Create verified resource entry
    const resource = await this.prisma.resource.create({
      data: {
        name: partner.orgName,
        type: this.mapOrgTypeToResourceType(partner.orgType),
        description: partner.description,
        address: partner.address,
        city: partner.city.toLowerCase(),
        state: partner.state,
        phone: partner.phone,
        email: partner.email,
        website: partner.website,
        workingHours: `${partner.workingDays} ${partner.workingHours}`,
        lat: partner.lat,
        lng: partner.lng,
        googleMapsUrl: partner.googleMapsUrl,
        services: partner.services,
        conditions: partner.conditions,
        feeSession: partner.feeSession,
        feeMonthly: partner.feeMonthly,
        tags: [partner.orgType, partner.city, partner.state],
        isVerified: true,
        isActive: true,
        approvedBy: approverId,
        approvedAt: new Date(),
      },
    })

    // Update partner status
    const updated = await this.prisma.partner.update({
      where: { id: partnerId },
      data: {
        status: 'APPROVED',
        isVisible: true,
        approvedAt: new Date(),
        approvedBy: approverId,
        resourceId: resource.id,
      },
    })

    // Notify partner of approval
    await this.notifyApproval(partner)

    this.logger.log(`✅ Partner approved: ${partner.orgName}`)
    return updated
  }

  async reject(partnerId: string, reason: string, approverId: string) {
    const partner = await this.prisma.partner.findUnique({ where: { id: partnerId } })
    if (!partner) throw new NotFoundException('Partner not found')

    const updated = await this.prisma.partner.update({
      where: { id: partnerId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        approvedBy: approverId,
      },
    })

    await this.notifyRejection(partner, reason)
    return updated
  }

  async getApproved() {
    return this.prisma.partner.findMany({
      where: { status: 'APPROVED', isVisible: true },
      select: {
        id: true, orgName: true, orgType: true, description: true,
        city: true, state: true, phone: true, website: true,
        services: true, workingHours: true, lat: true, lng: true,
        googleMapsUrl: true, registrationId: true,
      },
      orderBy: { approvedAt: 'desc' },
    })
  }

  async getPending(adminId: string) {
    // Verify admin
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } })
    if (!admin || !['ADMIN', 'FOUNDER'].includes(admin.role)) {
      throw new ForbiddenException('Access denied')
    }

    return this.prisma.partner.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    })
  }

  private mapOrgTypeToResourceType(orgType: string): any {
    const map: Record<string, string> = {
      'Special School': 'SCHOOL',
      'Inclusive School': 'SCHOOL',
      'Therapy Centre (Multi-disciplinary)': 'THERAPY',
      'Speech Therapy Centre': 'THERAPY',
      'OT (Occupational Therapy) Centre': 'THERAPY',
      'ABA / Behaviour Therapy Centre': 'THERAPY',
      'Specialist Hospital / Clinic': 'HOSPITAL',
      'Child Development Centre': 'HOSPITAL',
      'Sports Academy (Autism-friendly)': 'SPORTS',
      'Govt / NGO Resource Centre': 'GOVT',
    }
    return map[orgType] || 'THERAPY'
  }

  private async notifyFounder(partner: any) {
    await this.resend.emails.send({
      from: 'Ayushman System <noreply@ayushman.world>',
      to: 'ayushmans@outlook.in',
      subject: `🆕 New Partner Registration: ${partner.orgName} (${partner.registrationId})`,
      html: `
        <h2>New Partner Registration Received</h2>
        <p><strong>Organisation:</strong> ${partner.orgName}</p>
        <p><strong>Type:</strong> ${partner.orgType}</p>
        <p><strong>City:</strong> ${partner.city}, ${partner.state}</p>
        <p><strong>Contact:</strong> ${partner.contactName} — ${partner.contactPhone}</p>
        <p><strong>Email:</strong> ${partner.contactEmail}</p>
        <p><strong>Registration ID:</strong> ${partner.registrationId}</p>
        <p><strong>Services:</strong> ${partner.services?.join(', ')}</p>
        <br>
        <p><a href="https://ayushman.world/admin/partners/${partner.id}">Review & Approve →</a></p>
      `,
    }).catch((e) => this.logger.error('Founder notification failed:', e))
  }

  private async confirmToPartner(partner: any) {
    await this.resend.emails.send({
      from: 'Ayushman <partnerships@ayushman.world>',
      to: partner.contactEmail,
      subject: `Registration Received — ${partner.registrationId} | Ayushman`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #C8782A;">Thank you for partnering with Ayushman! 🤝</h1>
          <p>Dear ${partner.contactName},</p>
          <p>We've received your registration for <strong>${partner.orgName}</strong>.</p>
          <p><strong>Your Registration ID: ${partner.registrationId}</strong></p>
          <p>Our team will review your application and contact you within 24–48 hours for verification. Once approved, your organisation will be listed on ayushman.world where thousands of families are searching for services like yours.</p>
          <p>In the meantime, you'll receive payment instructions via a separate email.</p>
          <p>Questions? Call us: +91 82800 56665</p>
          <p>With gratitude,<br>BK Satpathy<br>Founder, Ayushman</p>
        </div>
      `,
    }).catch((e) => this.logger.error('Partner confirmation failed:', e))
  }

  private async notifyApproval(partner: any) {
    await this.resend.emails.send({
      from: 'Ayushman <partnerships@ayushman.world>',
      to: partner.contactEmail,
      subject: `🎉 Approved! ${partner.orgName} is now live on Ayushman`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #2D7A6B;">Congratulations — You're Live! 🎉</h1>
          <p>Dear ${partner.contactName},</p>
          <p>We're delighted to confirm that <strong>${partner.orgName}</strong> is now a verified Ayushman partner and your listing is live at <a href="https://ayushman.world/research">ayushman.world/research</a>.</p>
          <p>Families in ${partner.city} searching for ${partner.orgType} services will now find you immediately.</p>
          <p>Thank you for being part of our mission to support every special child.</p>
          <p>With gratitude,<br>BK Satpathy<br>Founder, Ayushman</p>
        </div>
      `,
    }).catch((e) => this.logger.error('Approval notification failed:', e))
  }

  private async notifyRejection(partner: any, reason: string) {
    await this.resend.emails.send({
      from: 'Ayushman <partnerships@ayushman.world>',
      to: partner.contactEmail,
      subject: `Ayushman Partner Application — Update Required`,
      html: `
        <p>Dear ${partner.contactName}, regarding your application for ${partner.orgName}: ${reason}. Please contact us at ayushmans@outlook.in to discuss further.</p>
      `,
    }).catch((e) => this.logger.error('Rejection notification failed:', e))
  }
}
