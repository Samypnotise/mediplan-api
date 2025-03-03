import User from '#models/user'
import { forgotPasswordValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import { Logger } from '@adonisjs/core/logger'
import type { Infer } from '@vinejs/vine/types'
import TokenService from './token_service.js'

@inject()
export default class AuthService {
  constructor(
    private logger: Logger,
    private tokenService: TokenService
  ) {}

  @inject()
  /**
   * Checks if an user exists before initiating password reset procedure
   */
  async forgotPassword({ email }: Infer<typeof forgotPasswordValidator>): Promise<void> {
    const user = await User.findBy('email', email)

    if (!user) {
      // We log, but do not give any details to the user
      this.logger.warn(`User ${email} not found`)
    } else {
      this.tokenService.createPasswordResetToken(user)
    }
  }
}
