import path from 'path'
import pug from 'pug'
import { emailTransporter } from '../../configs/email.config'
import { env } from '../../configs/env.config'

class EmailService {
  private renderTemplate(template: string, context: object) {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'templates',
      `${template}.pug`,
    )

    return pug.renderFile(templatePath, context)
  }

  async sendEmail(options: SendTemplateEmailOptions) {
    const { to, subject, template, context = {} } = options

    const html = this.renderTemplate(template, {
      subject,
      ...context,
    })

    await emailTransporter.sendMail({
      from: env.SMTP_USER,
      to,
      subject,
      html,
    })
  }
}

export const emailService = new EmailService()
