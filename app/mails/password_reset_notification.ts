import PasswordResetToken from '#models/password_reset_token'
import User from '#models/user'
import { BaseMail } from '@adonisjs/mail'

export default class PasswordResetNotification extends BaseMail {
  from = { name: 'Mediplan team', address: 'mediplan@dev.com' }
  subject = 'Your password reset link'

  constructor(
    private user: User,
    private token: PasswordResetToken
  ) {
    super()
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message.to(this.user.email)

    this.message.html(`
      <h1> Hi ${this.user.firstName}!</h1>
      <p>Please use this link to reset your password</p>
      <pre>${this.token.value}</pre>
      `)
  }
}
