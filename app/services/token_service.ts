import PasswordResetNotification from '#mails/password_reset_notification'
import PasswordResetToken from '#models/password_reset_token'
import User from '#models/user'
import mail from '@adonisjs/mail/services/main'

export default class TokenService {
  async getPasswordResetToken(
    token: string,
    expired: boolean = false
  ): Promise<PasswordResetToken | null> {
    return await PasswordResetToken.query()
      .if(!expired, (query) => query.withScopes((scope) => scope.isNotExpired()))
      .where('value', token)
      .first()
  }

  /**
   * Creates a reset token for a given user
   * @param user The target user for the token
   */
  async createPasswordResetToken(user: User) {
    const token = await user.related('passwordResetTokens').create({})

    this.sendPasswordResetNotification(user, token)
  }

  async deletePasswordResetTokens(user: User) {
    await PasswordResetToken.query().where('user_id', user.id).delete()
  }

  /**
   * Send an email with a password reset link
   * @param user The target user
   * @param token The related token
   */
  private async sendPasswordResetNotification(user: User, token: PasswordResetToken) {
    await mail.send(new PasswordResetNotification(user, token))
  }
}
