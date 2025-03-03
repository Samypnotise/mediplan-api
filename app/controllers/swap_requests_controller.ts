import NotFoundException from '#exceptions/not_found_exception'
import Mission from '#models/mission'
import SwapRequest from '#models/swap_request'
import { paginationValidator } from '#validators/pagination'
import {
  createRequestValidator,
  deleteRequestValidator,
  getRequestValidator,
  requestFilterValidator,
  requestSortOptions,
  updateRequestValidator,
} from '#validators/swap_requests'
import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@adonisjs/lucid'

export default class SwapRequestsController {
  /**
   * Display a list of resource
   */
  async index({ auth, request }: HttpContext) {
    const { page, limit } = await request.validateUsing(paginationValidator)
    const { missionId, senderId, receiverId, status, sort } =
      await request.validateUsing(requestFilterValidator)

    const sortMethod =
      requestSortOptions.find((option) => option.id === sort) || requestSortOptions[0]

    const requests = await SwapRequest.query()
      .preload('mission')
      .preload('sender')
      .preload('receiver')
      .withScopes((scopes) => scopes.visibleTo(auth.user!))
      .if(missionId, (query) => {
        query.where('mission_id', missionId!)
      })
      .if(senderId, (query) => {
        query.where('sender_id', senderId!)
      })
      .if(receiverId, (query) => {
        query.where('receiver_id', receiverId!)
      })
      .if(status, (query) => {
        query.where('status', status!.toString())
      })
      .orderBy(sortMethod.field, sortMethod.dir)
      .paginate(page || 1, limit || 10)

    return requests.serialize()
  }

  /**
   * Handle form submission for the create action
   */
  async store({ auth, bouncer, request }: HttpContext) {
    const { missionId, receiverId } = await request.validateUsing(createRequestValidator)

    const mission = await Mission.findOrFail(missionId)
    await bouncer.with('SwapRequestPolicy').authorize('create', mission)

    const swapRequest = await SwapRequest.create({ missionId, receiverId, senderId: auth.user!.id })

    await Promise.all([
      swapRequest.load('mission'),
      swapRequest.load('sender'),
      swapRequest.load('receiver'),
    ])

    return swapRequest
  }

  /**
   * Show individual record
   */
  async show({ auth, request }: HttpContext) {
    const { params } = await request.validateUsing(getRequestValidator)

    try {
      const swapRequest = await SwapRequest.query()
        .withScopes((scopes) => scopes.visibleTo(auth.user!))
        .where('id', params.id)
        .firstOrFail()

      await Promise.all([
        swapRequest.load('mission'),
        swapRequest.load('sender'),
        swapRequest.load('receiver'),
      ])

      return swapRequest
    } catch (error: unknown) {
      if (error instanceof errors.E_ROW_NOT_FOUND)
        throw new NotFoundException('Cannot find Swap Request', {
          code: 'E_SWAP_REQUEST_NOT_FOUND',
          cause: `The swap request with uuid ${params.id} does not exists.`,
        })
      else throw error
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ bouncer, request }: HttpContext) {
    const { params, status } = await request.validateUsing(updateRequestValidator)

    try {
      const swapRequest = await SwapRequest.findOrFail(params.id)
      await bouncer.with('SwapRequestPolicy').authorize('edit', swapRequest)

      swapRequest.status = status
      await swapRequest.save()

      await Promise.all([
        swapRequest.load('mission'),
        swapRequest.load('sender'),
        swapRequest.load('receiver'),
      ])

      return swapRequest
    } catch (error: unknown) {
      if (error instanceof errors.E_ROW_NOT_FOUND)
        throw new NotFoundException('Cannot update Swap Request', {
          code: 'E_SWAP_REQUEST_NOT_FOUND',
          cause: `The swap request with uuid ${params.id} does not exists.`,
        })
      else throw error
    }
  }

  /**
   * Delete record
   */
  async destroy({ bouncer, request }: HttpContext) {
    const { params } = await request.validateUsing(deleteRequestValidator)

    try {
      const swapRequest = await SwapRequest.findOrFail(params.id)
      await bouncer.with('SwapRequestPolicy').authorize('delete')

      await swapRequest.delete()
    } catch (error: unknown) {
      if (error instanceof errors.E_ROW_NOT_FOUND)
        throw new NotFoundException('Cannot delete Swap Request', {
          code: 'E_SWAP_REQUEST_NOT_FOUND',
          cause: `The swap request with uuid ${params.id} does not exists.`,
        })
      else throw error
    }
  }
}
