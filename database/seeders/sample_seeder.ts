import { UserFactory } from '#database/factories/user_factory'
import { UserType } from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Create a known email/password user for testing purposes
    try {
      await UserFactory.merge({
        email: 'caregiver@test.com',
        password: '123456Az',
        type: UserType.Caregiver,
      }).create()

      await UserFactory.merge({
        email: 'office@test.com',
        password: '123456Az',
        type: UserType.Office,
      }).create()
    } catch (error) {
      if (error.code === '23505') console.log('Users already exist, skipping...')
      else throw error
    }

    // Create sample users
    await UserFactory.with('missions', 5).merge({ password: '123456Az' }).createMany(10)
  }
}
