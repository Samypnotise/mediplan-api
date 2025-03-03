import vine from '@vinejs/vine'

export const UUIDPathParamSchema = vine.object({
  params: vine.object({
    id: vine.string().uuid(),
  }),
})

export type SortOption = {
  id: string
  field: string
  dir: 'asc' | 'desc' | undefined
}
