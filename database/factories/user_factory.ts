import User, { UserType } from '#models/user'
import factory from '@adonisjs/lucid/factories'
import { PasswordResetTokenFactory } from './password_reset_token_factory.js'
import { MissionFactory } from './mission_factory.js'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()

    return {
      firstName: firstName,
      lastName: lastName,
      email: faker.internet.email({ firstName: firstName, lastName: lastName }).toLocaleLowerCase(),
      type: faker.helpers.enumValue(UserType),
      password: faker.internet.password(),
    }
  })
  .relation('passwordResetTokens', () => PasswordResetTokenFactory)
  .relation('missions', () => MissionFactory)
  .build()
