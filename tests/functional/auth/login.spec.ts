import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Auth login tests', (group) => {
  group.teardown(async () => {
    testUtils.db().truncate()
  })

  test('empty body', async ({ client }) => {
    const response = await client.post('/auth/login')

    response.assertStatus(422)

    response.assertTextIncludes('The email field is required')
    response.assertTextIncludes('The password field is required')
  })

  test('invalid email', async ({ client }) => {
    const response = await client
      .post('/auth/login')
      .json({ email: 'test', password: 'weakpassword' })

    response.dump()

    response.assertStatus(422)

    response.assertTextIncludes('The value is not a valid email address')
  })

  test('invalid credentials', async ({ client }) => {
    const response = await client
      .post('/auth/login')
      .json({ email: 'foo@bar.com', password: 'password' })

    response.assertStatus(400)

    response.assertTextIncludes('Invalid user credentials')
  })

  test('successful login', async ({ assert, client }) => {
    const user = await UserFactory.merge({
      email: 'test@example.com',
      password: '123456Az',
    }).create()

    const response = await client
      .post('/auth/login')
      .json({ email: 'test@example.com', password: '123456Az' })

    response.assertStatus(200)
    response.assertTextIncludes('oat_')

    const accessTokens = await User.accessTokens.all(user)

    assert.equal(accessTokens.length, 1)
  })
})
