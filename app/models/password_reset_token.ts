import { BaseModel, beforeCreate, belongsTo, column, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomBytes } from 'node:crypto'
import User from '#models/user'

export default class PasswordResetToken extends BaseModel {
  static isExpired = scope((query) => {
    query.where('expires_at', '<=', DateTime.now().toSQL())
  })

  static isNotExpired = scope((query) => {
    query.where('expires_at', '>', DateTime.now().toSQL())
  })

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column()
  declare value: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime()
  declare expiresAt: DateTime

  /**
   * Checks if a token is expired
   */
  get isExpired() {
    return DateTime.now() > this.expiresAt
  }

  /** HOOKS */
  @beforeCreate()
  static async generateToken(token: PasswordResetToken) {
    const tokenValue = await randomBytes(32).toString('hex')
    token.value = tokenValue
  }

  @beforeCreate()
  static setTokenExpiration(token: PasswordResetToken) {
    token.expiresAt = DateTime.now().plus({ minutes: 30 })
  }
}
