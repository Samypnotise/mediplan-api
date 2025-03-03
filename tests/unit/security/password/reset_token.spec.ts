import { UserFactory } from '#database/factories/user_factory'
import PasswordResetToken from '#models/password_reset_token'
import { test } from '@japa/runner'
import timekeeper from 'timekeeper'

test.group('Password reset token duration test', (group) => {
  group.setup(() => {
    timekeeper.freeze(new Date('2024-10-23T12:00:00Z'))
  })

  test('has correct duration', async ({ assert }) => {
    const user = await UserFactory.with('passwordResetTokens', 1).create()
    await user.load('passwordResetTokens')
    const token = user.passwordResetTokens[0]

    const expectedExpirationTime = new Date('2024-10-23T12:30:00Z')

    assert.deepEqual(token.expiresAt.toJSDate(), expectedExpirationTime)
  }).skip()

  test('scopes are valid', async ({ assert }) => {
    await UserFactory.with('passwordResetTokens', 10).create()

    let validTokens = await PasswordResetToken.query().withScopes((scope) => scope.isNotExpired())
    let expiredTokens = await PasswordResetToken.query().withScopes((scope) => scope.isExpired())
    assert.equal(validTokens.length, 10)
    assert.equal(expiredTokens.length, 0)

    // We travel 30 minutes later
    timekeeper.travel(new Date('2024-10-23T12:30:00Z'))

    validTokens = await PasswordResetToken.query().withScopes((scope) => scope.isNotExpired())
    expiredTokens = await PasswordResetToken.query().withScopes((scope) => scope.isExpired())
    assert.equal(validTokens.length, 0)
    assert.equal(expiredTokens.length, 10)
  }).skip()
})
