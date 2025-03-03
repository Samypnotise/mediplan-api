import { UserFactory } from '#database/factories/user_factory'
import PasswordResetNotification from '#mails/password_reset_notification'
import User, { UserType } from '#models/user'
import hash from '@adonisjs/core/services/hash'
import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'

test.group('User creation', (group) => {
  let user: User

  group.setup(async () => {
    user = await UserFactory.merge({ type: UserType.Office }).create()
  })

  test('route needs authentication', async ({ client }) => {
    const response = await client.post('/users').json({})

    response.assertStatus(401)
  })

  test('Unauthorized for caregivers', async ({ client }) => {
    // We create an user with the caregiver role
    const unauthorizedUser = await UserFactory.merge({ type: UserType.Caregiver }).create()

    const response = await client.post('/users').json({}).loginAs(unauthorizedUser)

    response.assertStatus(403)
    response.assertTextIncludes('You are not allowed to create users')
  })

  test('create user successfully', async ({ client, cleanup }) => {
    // Fake the hash service to speed up tests
    hash.fake()
    // Fake the mail service
    const { mails } = mail.fake()

    const response = await client
      .post('/users')
      .json({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        type: 'CAREGIVER',
      })
      .loginAs(user)

    const createdUser = await User.findOrFail(response.body().id)

    response.assertStatus(201)
    response.assertBody(createdUser.serialize())

    mails.assertSent(PasswordResetNotification, ({ message }) => {
      return message.hasSubject('Your password reset link')
    })

    cleanup(() => {
      hash.restore()
      mail.restore()
    })
  })

  test('fails if email is already taken', async ({ client }) => {
    const response = await client
      .post('/users')
      .json({
        firstName: 'John',
        lastName: 'AnotherDoe',
        email: 'john.doe@email.com',
        type: 'CAREGIVER',
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertTextIncludes('This email address is already used')
  })

  test('fails with invalid fields', async ({ client }) => {
    const response = await client
      .post('/users')
      .json({
        firstName: '544',
        lastName: '887',
        email: 'invalid.email@',
        type: 'INVALID',
      })
      .loginAs(user)

    response.assertStatus(422)
    response.assertTextIncludes('The value is not a valid email address')
    response.assertTextIncludes('The first name must only contain letters')
    response.assertTextIncludes('The last name must only contain letters')
    response.assertTextIncludes('The user role must be either OFFICE or CAREGIVER')
  })

  test('fails with missing fields', async ({ client }) => {
    const response = await client.post('/users').json({}).loginAs(user)

    response.assertStatus(422)
    response.assertTextIncludes('The email field is required')
    response.assertTextIncludes('The firstName field is required')
    response.assertTextIncludes('The lastName field is required')
    response.assertTextIncludes('The type field is required')
  })
})
