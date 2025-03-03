import PasswordResetToken from '#models/password_reset_token'
import factory from '@adonisjs/lucid/factories'

export const PasswordResetTokenFactory = factory
  .define(PasswordResetToken, async () => {
    return {}
  })
  .build()
