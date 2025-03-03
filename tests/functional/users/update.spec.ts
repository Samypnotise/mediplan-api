import { UserFactory } from '#database/factories/user_factory'
import User, { UserType } from '#models/user'
import { test } from '@japa/runner'

let authUser: User
let testUser: User
let path: string

test.group('Users update', (group) => {
  group.setup(async () => {
    authUser = await UserFactory.merge({
      email: 'donotreusethisemail@test.com',
      type: UserType.Office,
    }).create()
    testUser = await UserFactory.create()

    path = `/users/${testUser.id}`
  })

  test('route needs authentication', async ({ client }) => {
    // This UUID is random and does not serve any purpose
    const response = await client.put(path).json({})

    response.assertStatus(401)
  })

  test('parameters is an uuid', async ({ client }) => {
    const response = await client.put('/users/1').json({}).loginAs(authUser)

    response.assertStatus(404)
  })

  test('all fields are required', async ({ client }) => {
    const response = await client.put(path).json({}).loginAs(authUser)

    response.assertStatus(422)
    response.assertTextIncludes('The firstName field is required')
    response.assertTextIncludes('The lastName field is required')
    response.assertTextIncludes('The email field is required')
  })

  test('fails with invalid fields', async ({ client }) => {
    const response = await client
      .put(path)
      .json({
        firstName: '007',
        lastName: '007',
        email: 'invalid.email@',
      })
      .loginAs(authUser)

    response.assertStatus(422)
    response.assertTextIncludes('The value is not a valid email address')
    response.assertTextIncludes('The first name must only contain letters')
    response.assertTextIncludes('The last name must only contain letters')
  })

  test('fails if email is already taken by another user', async ({ client }) => {
    const response = await client
      .put(path)
      .json({ firstName: 'John', lastName: 'Does', email: 'donotreusethisemail@test.com' })
      .loginAs(authUser)

    response.assertStatus(422)
    response.assertTextIncludes('This email address is already used')
  })

  test('office user can update another user', async ({ client }) => {
    const response = await client
      .put(path)
      .json({
        firstName: 'John',
        lastName: 'Cena',
        email: 'updatedjohn@cena.com',
      })
      .loginAs(authUser)

    testUser = await User.findOrFail(testUser.id)

    response.assertStatus(200)
    response.assertBody(testUser.serialize())
  })

  test('user can update itself', async ({ client }) => {
    const response = await client
      .put(path)
      .json({ email: 'updated@jon.com', firstName: 'Up', lastName: 'Dated' })
      .loginAs(testUser)

    response.assertStatus(200)
  })

  test('caregivers cannot update other users', async ({ client }) => {
    const unauthorizedUser = await UserFactory.merge({ type: UserType.Caregiver }).create()

    const response = await client
      .put(path)
      .json({
        email: 'donotupdate@email.com',
        firstName: 'Malicious',
        lastName: 'Update',
      })
      .loginAs(unauthorizedUser)

    response.assertStatus(403)
  })
})
