import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'
import { DateTime } from 'luxon'

async function dateTime(value: unknown, _: unknown, field: FieldContext) {
  if (typeof value !== 'string') {
    field.report('The {{ field }} is not a string', 'datetime', field)
    return
  }

  if (!DateTime.fromISO(value).isValid) {
    field.report('The {{ field }} is not a valid ISO date time value', 'datetime', field)
    return
  }

  field.meta.$value = DateTime.fromISO(value)
  field.mutate(DateTime.fromISO(value), field)
}

/**
 * Converting a function to a VineJS rule
 */
export const dateTimeRule = vine.createRule(dateTime)
