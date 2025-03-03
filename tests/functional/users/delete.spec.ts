import { UserFactory } from '#database/factories/user_factory'
import User, { UserType } from '#models/user'
import { test } from '@japa/runner'

test.group('Users delete', (group) => {
  let authorizedUser: User
  let testUser: User

  let path: string
  group.setup(async () => {
    authorizedUser = await UserFactory.merge({ type: UserType.Office }).create()
    testUser = await UserFactory.merge({ type: UserType.Office }).create()

    path = `/users/${testUser.id}`
  })
  test('route needs authentication', async ({ client }) => {
    const response = await client.delete(path)

    response.assertStatus(401)
  })

  test('user cannot delete itself', async ({ client }) => {
    const response = await client.delete(path).loginAs(testUser)

    response.assertStatus(403)
    response.assertTextIncludes('You cannot delete yourself')
  })

  test('caregiver cannot delete other users', async ({ client }) => {
    const unauthorizedUser = await UserFactory.merge({ type: UserType.Caregiver }).create()
    const response = await client.delete(path).loginAs(unauthorizedUser)

    response.assertStatus(403)
  })

  test('User deletion is successfull', async ({ client, assert }) => {
    const response = await client.delete(path).loginAs(authorizedUser)

    const user = await User.find(testUser.id)

    response.assertStatus(200)
    assert.isNull(user)
  })
})
