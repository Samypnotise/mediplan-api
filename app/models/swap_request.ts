import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeCreate,
  beforeUpdate,
  belongsTo,
  column,
  scope,
} from '@adonisjs/lucid/orm'
import User, { UserType } from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Mission from '#models/mission'
import MethodNotAllowedException from '#exceptions/method_not_allowed_exception'
import ConflictException from '#exceptions/conflict_exception'
import SwapRequestAccepted from '#events/swap_request_accepted'

export default class SwapRequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column({ serializeAs: null })
  declare missionId: string

  @belongsTo(() => Mission)
  declare mission: BelongsTo<typeof Mission>

  @column({ serializeAs: null })
  declare senderId: string

  @belongsTo(() => User, { foreignKey: 'senderId' })
  declare sender: BelongsTo<typeof User>

  @column({ serializeAs: null })
  declare receiverId: string

  @belongsTo(() => User, { foreignKey: 'receiverId' })
  declare receiver: BelongsTo<typeof User>

  @column()
  declare status: SwapRequestStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  static visibleTo = scope((query, user: User) => {
    if (user.type === UserType.Office) {
      return
    }

    // Grouping where clauses so we can chain after the scope query
    query.where((group) => group.where('senderId', user.id).orWhere('receiverId', user.id))
  })

  /**
   * This sets the status to PENDING automatically when creating the swap request
   */
  @beforeCreate()
  static setStatus(request: SwapRequest) {
    request.status = SwapRequestStatus.Pending
  }

  /**
   * This checks if the request can be updated
   */
  @beforeUpdate()
  static checkStatus(request: SwapRequest) {
    const originalStatus = request.$original.status
    if (
      originalStatus === SwapRequestStatus.Accepted ||
      originalStatus === SwapRequestStatus.Rejected
    ) {
      throw new MethodNotAllowedException(['GET', 'DELETE'], 'Cannot update Swap Request', {
        code: 'E_SWAP_REQUEST_READONLY',
        cause: 'The swap reject has a state ACCEPTED or REJECTED. Therefore, it cannot be updated',
      })
    }
  }

  /**
   * This updates the mission's foreign key related to the assignee, so when the
   * request is accepted, the new assignee is automatically updated in the missions table
   */
  @beforeUpdate()
  static async updateAssigneeWhenAccepted(request: SwapRequest) {
    if (request.$dirty.status) {
      // Checks if the user still exists
      const newAssignee = await User.find(request.receiverId)
      if (!newAssignee)
        throw new ConflictException('Cannot update Swap Request', {
          code: 'E_receiver_DOES_NOT_EXISTS',
          cause: `The assigned user with uuid ${request.receiverId} does not exists anymore.`,
        })

      const relatedMission = await Mission.findOrFail(request.missionId)
      relatedMission.assigneeId = newAssignee.id
      await relatedMission.save()

      SwapRequestAccepted.dispatch(request)
    }
  }
}

export enum SwapRequestStatus {
  Pending = 'PENDING',
  Accepted = 'ACCEPTED',
  Rejected = 'REJECTED',
  Expired = 'EXPIRED',
}
