import NotFoundException from '#exceptions/not_found_exception'
import Mission from '#models/mission'
import {
  deleteMissionValidator,
  getMissionsValidator,
  getMissionValidator,
  missionSortOptions,
  patchMissionValidator,
  postMissionValidator,
  putMissionValidator,
} from '#validators/mission'
import { paginationValidator } from '#validators/pagination'
import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@adonisjs/lucid'

export default class MissionsController {
  /**
   * Return a paginated list of missions
   */
  async index({ request, auth }: HttpContext) {
    const { page, limit } = await request.validateUsing(paginationValidator)
    const { search, assigneeId, sort } = await request.validateUsing(getMissionsValidator)

    const sortMethod =
      missionSortOptions.find((option) => option.id === sort) || missionSortOptions[0]

    const missions = await Mission.query()
      .withScopes((scopes) => scopes.visibleTo(auth.user!))
      .if(search, (query) => {
        query.whereILike('title', `%${search}%`).orWhereILike('patient', `%${search}%`)
      })
      .if(assigneeId, (query) => {
        query.where('assigneeId', assigneeId!)
      })
      .orderBy(sortMethod.field, sortMethod.dir)
      .paginate(page || 1, limit || 10)

    return missions.serialize()
  }

  /**
   * Handle mission creation
   */
  async store({ request }: HttpContext) {
    const { assignee, ...body } = await request.validateUsing(postMissionValidator)

    const mission = await Mission.create({ ...body, assigneeId: assignee.id })

    // Load the assignee relation to return the related user
    await mission.load('assignee')

    return mission
  }

  /**
   * Show individual mission
   */
  async show({ request }: HttpContext) {
    const { params } = await request.validateUsing(getMissionValidator)

    try {
      const mission = await Mission.findOrFail(params.id)
      await mission.load('assignee')

      return mission
    } catch (error: unknown) {
      if (error instanceof errors.E_ROW_NOT_FOUND)
        throw new NotFoundException('Cannot find mission', {
          code: 'E_MISSION_NOT_FOUND',
          cause: `The mission with uuid ${params.id} does not exist.`,
        })
      else throw error
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ request }: HttpContext) {
    let usedValidator
    // Validate all body fields
    if (request.method() === 'PUT') {
      usedValidator = putMissionValidator
    } else {
      usedValidator = patchMissionValidator
    }

    const { params, assignee, ...body } = await request.validateUsing(usedValidator)

    try {
      const mission = await Mission.findOrFail(params.id)

      let data
      if (assignee?.id) data = { ...body, assigneeId: assignee.id }
      else data = body

      await mission.merge(data).save()

      await mission.load('assignee')

      return mission
    } catch (error: unknown) {
      if (error instanceof errors.E_ROW_NOT_FOUND)
        throw new NotFoundException('Cannot update mission', {
          code: 'E_MISSION_NOT_FOUND',
          cause: `The mission with uuid ${params.id} does not exist.`,
        })
      else throw error
    }
  }

  /**
   * Delete record
   */
  async destroy({ request }: HttpContext) {
    const { params } = await request.validateUsing(deleteMissionValidator)

    try {
      const mission = await Mission.findOrFail(params.id)
      await mission.delete()
    } catch (error: unknown) {
      if (error instanceof errors.E_ROW_NOT_FOUND)
        throw new NotFoundException('Cannot delete mission', {
          code: 'E_MISSION_NOT_FOUND',
          cause: `The mission with uuid ${params.id} does not exist.`,
        })
      else throw error
    }
  }
}
