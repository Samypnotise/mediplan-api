import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, scope } from '@adonisjs/lucid/orm'
import User, { UserType } from '#models/user'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import SwapRequest from './swap_request.js'

export default class Mission extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare patient: string

  @column.dateTime()
  declare start: DateTime

  @column.dateTime()
  declare end: DateTime

  @column()
  declare address: string

  @column()
  declare latitude: number

  @column()
  declare longitude: number

  @column({ serializeAs: null })
  declare assigneeId: string

  @belongsTo(() => User, { foreignKey: 'assigneeId' })
  declare assignee: BelongsTo<typeof User>

  @hasMany(() => SwapRequest)
  declare mission: HasMany<typeof SwapRequest>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  static visibleTo = scope((query, user: User) => {
    if (user.type === UserType.Office) {
      return
    }

    query.where((group) => group.where('assigneeId', user.id))
  })
}
