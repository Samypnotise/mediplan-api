import vine from '@vinejs/vine'

export const paginationValidator = vine.compile(
  vine.object({
    page: vine.number().withoutDecimals().positive().optional(),
    limit: vine.number().in([10, 20, 50, 100]).optional(),
  })
)
