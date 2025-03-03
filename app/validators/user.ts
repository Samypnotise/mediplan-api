import { UserType } from '#models/user'
import vine from '@vinejs/vine'
import { SortOption } from '#validators/common'

/**
 * Validates the param given in GET /users/:id
 *
 * The id needs to be a valid UUID
 */
export const getUserByIdValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
  })
)

export const createUserValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim().alpha(),
    lastName: vine.string().trim().alpha(),
    type: vine.enum(UserType),
    email: vine
      .string()
      .email()
      .normalizeEmail({
        all_lowercase: true,
      })
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
  })
)

/**
 * Validates the param and body given in PUT /users/:id
 */
export const updateUserValidator = vine.withMetaData<{ userId: number }>().compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
    firstName: vine.string().trim().alpha(),
    lastName: vine.string().trim().alpha(),
    email: vine
      .string()
      .trim()
      .email()
      .normalizeEmail({
        all_lowercase: true,
      })
      .unique(async (db, value, field) => {
        const user = await db
          .from('users')
          .whereNot('id', field.meta.userId)
          .where('email', value)
          .first()
        return !user
      }),
  })
)

/**
 * Validates the param given in DELETE /users/:id
 */
export const deleteUserValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
  })
)

export const userFilterValidator = vine.compile(
  vine.object({
    search: vine.string().alphaNumeric().optional(),
    type: vine.enum(UserType).optional(),
    sort: vine
      .string()
      .exists(async (_db, value) => {
        return userSortOptions.some((option) => option.id === value)
      })
      .optional(),
  })
)

export type UserSortOptions = SortOption[]

export const userSortOptions: UserSortOptions = [
  { id: 'first_asc', field: 'first_name', dir: 'asc' },
  { id: 'first_desc', field: 'first_name', dir: 'desc' },
  { id: 'last_asc', field: 'last_name', dir: 'asc' },
  { id: 'last_desc', field: 'last_name', dir: 'desc' },
]
