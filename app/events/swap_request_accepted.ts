import SwapRequest from '#models/swap_request'
import { BaseEvent } from '@adonisjs/core/events'

export default class SwapRequestAccepted extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public request: SwapRequest) {
    super()
  }
}
