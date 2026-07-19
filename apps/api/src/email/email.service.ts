import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'
import { welcomeTemplate } from './templates/welcome.template'
import { verifyEmailTemplate } from './templates/verify-email.template'
import { passwordResetTemplate } from './templates/password-reset.template'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private readonly resend: Resend
  private readonly fromEmail: string
  private readonly fromName: string
  private readonly replyTo: string
  private readonly isDev: boolean

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY', '')
    this.resend = new Resend(apiKey !== '' ? apiKey : 'dev-key')
    this.fromEmail = config.get<string>('RESEND_FROM_EMAIL', 'noreply@ayushman.world')
    this.fromName = config.get<string>('RESEND_FROM_NAME', 'Ayushman')
    this.replyTo = config.get<string>('RESEND_REPLY_TO', 'support@ayushman.world')
    this.isDev = config.get<string>('NODE_ENV', 'development') !== 'production'
  }

  private get from(): string {
    return `${this.fromName} <${this.fromEmail}>`
  }

  private async send(params: {
    to: string
    subject: string
    html: string
    text?: string
  }): Promise<void> {
    if (this.isDev) {
      this.logger.debug(`[DEV EMAIL] To: ${params.to} | Subject: ${params.subject}`)
      this.logger.debug(`[DEV EMAIL] View at: http://localhost:8025`)
      // In development, log but don't fail if Resend key is missing
    }

    try {
      await this.resend.emails.send({
        from: this.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        replyTo: this.replyTo,
      })
    } catch (error) {
      // Email failures should never break the main operation
      this.logger.error(`Failed to send email to ${params.to}: ${String(error)}`)
    }
  }

  /**
   * Send welcome email after registration.
   */
  async sendWelcome(params: {
    to: string
    name: string
  }): Promise<void> {
    await this.send({
      to: params.to,
      subject: `Welcome to Ayushman, ${params.name}! 💛`,
      html: welcomeTemplate({ name: params.name }),
    })
  }

  /**
   * Send email verification link.
   */
  async sendEmailVerification(params: {
    to: string
    name: string
    token: string
  }): Promise<void> {
    const appUrl = this.config.get<string>('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')
    const verifyUrl = `${appUrl}/verify-email?token=${params.token}`

    await this.send({
      to: params.to,
      subject: 'Verify your Ayushman account',
      html: verifyEmailTemplate({ name: params.name, verifyUrl }),
    })
  }

  /**
   * Send password reset link.
   */
  async sendPasswordReset(params: {
    to: string
    name: string
    token: string
  }): Promise<void> {
    const appUrl = this.config.get<string>('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')
    const resetUrl = `${appUrl}/reset-password?token=${params.token}`

    await this.send({
      to: params.to,
      subject: 'Reset your Ayushman password',
      html: passwordResetTemplate({ name: params.name, resetUrl }),
    })
  }

  /**
   * Send partner registration notification to founder.
   */
  async sendPartnerRegistrationAlert(params: {
    orgName: string
    contactName: string
    contactEmail: string
    contactPhone: string
    registrationId: string
    partnerId: string
  }): Promise<void> {
    const adminUrl = this.config.get<string>('NEXT_PUBLIC_ADMIN_URL', 'http://localhost:3001')

    await this.send({
      to: 'ayushmans@outlook.in',
      subject: `🆕 New Partner Registration: ${params.orgName} (${params.registrationId})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #C8782A;">New Partner Registration</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6B5D50; font-size: 13px;">Organisation</td><td style="font-weight: bold;">${params.orgName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B5D50; font-size: 13px;">Contact</td><td>${params.contactName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B5D50; font-size: 13px;">Email</td><td>${params.contactEmail}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B5D50; font-size: 13px;">Phone</td><td>${params.contactPhone}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B5D50; font-size: 13px;">Registration ID</td><td style="font-family: monospace;">${params.registrationId}</td></tr>
          </table>
          <br>
          <a href="${adminUrl}/admin/partners/${params.partnerId}" style="background: #C8782A; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Review & Approve →
          </a>
        </div>
      `,
    })
  }
}
