import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

let user: User

test.group('Auth logout', (group) => {
  group.setup(async () => {
    user = await UserFactory.create()
  })

  group.teardown(async () => {
    testUtils.db().truncate()
  })

  test('not authenticated', async ({ client }) => {
    const response = await client.post('/auth/logout')

    response.assertStatus(401)
  })

  test('authenticated', async ({ assert, client }) => {
    const response = await client.post('/auth/logout').loginAs(user)

    response.assertStatus(200)

    const accessTokens = await User.accessTokens.all(user)

    assert.equal(accessTokens.length, 0)
  })
})
