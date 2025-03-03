import { SwapRequestStatus } from '#models/swap_request'
import { SortOption } from '#validators/common'
import vine from '@vinejs/vine'

export type RequestSortOption = SortOption[]

export const requestSortOptions: RequestSortOption = [
  { id: 'created_asc', field: 'createdAt', dir: 'asc' },
  { id: 'created_desc', field: 'createdAt', dir: 'desc' },
]

export const requestFilterValidator = vine.compile(
  vine.object({
    missionId: vine.string().uuid().optional(),
    senderId: vine.string().uuid().optional(),
    receiverId: vine.string().uuid().optional(),
    status: vine.enum(SwapRequestStatus).optional(),
    sort: vine
      .string()
      .exists(async (_db, value) => {
        return requestSortOptions.some((option) => option.id === value)
      })
      .optional(),
  })
)

const existingUserSchema = vine.string().exists(async (db, value) => {
  const user = await db.from('users').where('id', value).first()
  return user
})

const existingMissionSchema = vine.string().exists(async (db, value) => {
  const mission = await db.from('missions').where('id', value).first()
  return mission
})

/**
 * Validates the data for POST /swap-requests
 */
export const createRequestValidator = vine.compile(
  vine.object({
    missionId: existingMissionSchema.clone(),
    receiverId: existingUserSchema.clone(),
  })
)

/**
 * Validates the data for GET /swap-requests/{id}
 */
export const getRequestValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
  })
)

/**
 * Validates the data for PATCH /swap-requests/{id}
 */
export const updateRequestValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
    status: vine.enum(SwapRequestStatus),
  })
)

/**
 * Validates the data for DELETE /swap-requests/{id}
 */
export const deleteRequestValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
  })
)
