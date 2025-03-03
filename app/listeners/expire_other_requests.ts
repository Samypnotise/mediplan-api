import SwapRequestAccepted from '#events/swap_request_accepted'
import SwapRequest, { SwapRequestStatus } from '#models/swap_request'

export default class ExpireOtherRequests {
  async handle(event: SwapRequestAccepted) {
    await SwapRequest.query()
      .where('missionId', event.request.missionId)
      .where('status', SwapRequestStatus.Pending)
      .update({ status: SwapRequestStatus.Expired })
  }
}
