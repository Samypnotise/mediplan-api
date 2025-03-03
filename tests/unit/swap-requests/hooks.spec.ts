import { UserFactory } from '#database/factories/user_factory'
import SwapRequest, { SwapRequestStatus } from '#models/swap_request'
import { test } from '@japa/runner'

test.group('Swap requests hooks', () => {
  test('should set initial status to PENDING', async ({ assert }) => {
    const users = await UserFactory.with('missions', 1).createMany(2)
    const sender = users[0]
    const receiver = users[1]
    const mission = await sender.related('missions').query().firstOrFail()

    const request = new SwapRequest()
    await Promise.all([
      request.related('mission').associate(mission),
      request.related('sender').associate(sender),
      request.related('receiver').associate(receiver),
    ])
    console.log(request)

    assert.equal(request.status, SwapRequestStatus.Pending)
  })
})
