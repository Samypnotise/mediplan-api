import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import PasswordResetToken from './password_reset_token.js'
import Mission from '#models/mission'
import SwapRequest from './swap_request.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare email: string

  @column()
  declare type: UserType

  @column({ serializeAs: null })
  declare avatar: string | null

  @column({ serializeAs: null })
  declare password: string

  @hasMany(() => Mission, { foreignKey: 'assigneeId' })
  declare missions: HasMany<typeof Mission>

  @hasMany(() => SwapRequest, { foreignKey: 'senderId' })
  declare swapRequestsAsSender: HasMany<typeof SwapRequest>

  @hasMany(() => SwapRequest, { foreignKey: 'receiverId' })
  declare swapRequestsAsreceiver: HasMany<typeof SwapRequest>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)

  @hasMany(() => PasswordResetToken)
  declare passwordResetTokens: HasMany<typeof PasswordResetToken>
}

export enum UserType {
  Caregiver = 'CAREGIVER',
  Office = 'OFFICE',
}
