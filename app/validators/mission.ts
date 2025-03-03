import vine from '@vinejs/vine'
import { SortOption } from '#validators/common'

const assigneeSchema = vine.object({
  id: vine.string().exists(async (db, value) => {
    const user = await db.from('users').where('id', value).first()
    return user
  }),
})

type MissionSortOptions = SortOption[]

export const missionSortOptions: MissionSortOptions = [
  { id: 'title_asc', field: 'title', dir: 'asc' },
  { id: 'title_desc', field: 'title', dir: 'desc' },
  { id: 'start_asc', field: 'start', dir: 'asc' },
  { id: 'start_desc', field: 'start', dir: 'desc' },
  { id: 'end_asc', field: 'end', dir: 'asc' },
  { id: 'end_desc', field: 'end', dir: 'desc' },
]

/**
 * Validates the data for GET /missions
 */
export const getMissionsValidator = vine.compile(
  vine.object({
    search: vine.string().optional(),
    assigneeId: vine.string().uuid().optional(),
    sort: vine
      .string()
      .exists(async (_db, value) => {
        return missionSortOptions.some((option) => option.id === value)
      })
      .optional(),
  })
)

/**
 * Validates the data for GET /missions/:id
 */
export const getMissionValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
  })
)

/**
 * Validates the data for POST /missions
 */
export const postMissionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().alphaNumeric({ allowSpaces: true }),
    patient: vine.string().trim().alpha({ allowSpaces: true }),
    start: vine.dateTime(),
    end: vine.dateTime(),
    address: vine.string().trim(),
    latitude: vine.number().range([-90.0, 90.0]),
    longitude: vine.number().range([-180.0, 180.0]),
    assignee: assigneeSchema.clone(),
  })
)

/**
 * Validates the data for PUT /missions/:id
 * All the fields are required
 */
export const putMissionValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
    title: vine.string().trim().alphaNumeric({ allowSpaces: true }),
    patient: vine.string().trim().alpha({ allowSpaces: true }),
    start: vine.dateTime(),
    end: vine.dateTime(),
    latitude: vine.number().range([-90.0, 90.0]),
    longitude: vine.number().range([-180.0, 180.0]),
    assignee: assigneeSchema.clone(),
  })
)

/**
 * Validates the data in PATCH /missions/:id
 * All fields are tagged as optional
 */
export const patchMissionValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
    title: vine.string().trim().alphaNumeric({ allowSpaces: true }).optional(),
    patient: vine.string().trim().alpha({ allowSpaces: true }).optional(),
    start: vine.dateTime().optional(),
    end: vine.dateTime().optional(),
    latitude: vine.number().range([-90.0, 90.0]),
    longitude: vine.number().range([-180.0, 180.0]),
    assignee: assigneeSchema.clone().optional(),
  })
)

/**
 * Validates the data for DELETE /missions/:id
 */
export const deleteMissionValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
  })
)
