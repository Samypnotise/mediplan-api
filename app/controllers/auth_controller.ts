import User from '#models/user'
import AuthService from '#services/auth_service'
import TokenService from '#services/token_service'
import { forgotPasswordValidator, loginValidator, resetPasswordValidator } from '#validators/auth'
import { AccessToken } from '@adonisjs/auth/access_tokens'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

@inject()
export default class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  /**
   * Logs in an user given its username and its password
   */
  async login({ request }: HttpContext): Promise<AccessToken> {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)

    const token = User.accessTokens.create(user)

    return token
  }

  /**
   * Logs out an user, delete its current access token
   */
  async logout({ auth }: HttpContext) {
    await User.accessTokens.delete(auth.user!, auth.user!.currentAccessToken.identifier)
  }

  /**
   * Revokes all the tokens from an user
   * Also known as "logout from everywhere"
   */
  async revokeAllTokens({ auth }: HttpContext) {
    await db.rawQuery('DELETE FROM auth_access_tokens WHERE tokenable_id = :id', {
      id: auth.user?.id,
    })
  }

  /**
   * Creates a reset token
   * This sends a link to the user's email in order to reset its password
   * Note : the email is sent only if the account exists
   */
  async forgotPassword({ request }: HttpContext) {
    const data = await request.validateUsing(forgotPasswordValidator)

    this.authService.forgotPassword(data)
  }

  /**
   * Resets the password of an user
   */
  async resetPassword({ request, response }: HttpContext) {
    const { password, token } = await request.validateUsing(resetPasswordValidator)

    const resetToken = await this.tokenService.getPasswordResetToken(token)
    if (!resetToken) return response.notFound('Invalid or expired token')

    await resetToken.load('user')
    const user = resetToken.user
    user.password = password
    user.save()

    await this.tokenService.deletePasswordResetTokens(user)
  }
}
