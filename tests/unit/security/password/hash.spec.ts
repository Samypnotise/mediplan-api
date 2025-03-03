import { UserFactory } from '#database/factories/user_factory'
import hash from '@adonisjs/core/services/hash'
import { test } from '@japa/runner'

test.group('Password hashing test', () => {
  test('hashes user password when creating a new user', async ({ assert }) => {
    const user = await UserFactory.merge({ password: '123456Az' }).create()

    assert.notEqual('123456Az', user.password)
    assert.isTrue(user.password.startsWith('$scrypt$'))
    assert.isTrue(hash.isValidHash(user.password))
    assert.isTrue(await hash.verify(user.password, '123456Az'))
  })
})
