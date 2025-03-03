import User, { UserType } from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import Mission from '#models/mission'
import SwapRequest from '#models/swap_request'

export default class SwapRequestPolicy extends BasePolicy {
  async before(user: User | null) {
    if (user && user.type === UserType.Office) return true
  }

  /**
   * Only the mission assignee can create a swap request
   */
  create(user: User, mission: Mission) {
    return mission.assigneeId === user.id
  }

  /**
   * Only the receiver can accept/reject the request
   */
  edit(user: User, request: SwapRequest) {
    return request.receiverId === user.id
  }

  delete() {
    return false
  }
}
