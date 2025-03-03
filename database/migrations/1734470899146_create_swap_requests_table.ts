import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'swap_requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))

      table.uuid('sender_id').references('users.id').onDelete('SET NULL')
      table.uuid('receiver_id').references('users.id').onDelete('SET NULL')

      table.uuid('mission_id').references('missions.id').onDelete('CASCADE')

      table.enu('status', ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'], {
        useNative: true,
        enumName: 'request_status',
        existingType: false,
      })

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS "request_status"')
  }
}
