import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))

      table.string('first_name').notNullable()
      table.string('last_name').notNullable()

      table.string('email', 254).notNullable().unique()

      table.enu('type', ['CAREGIVER', 'OFFICE'], {
        useNative: true,
        enumName: 'user_type',
        existingType: false,
      })

      table.string('avatar', 254).nullable()

      table.string('password').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS "user_type"')
  }
}
