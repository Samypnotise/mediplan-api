import { BaseLiteralType } from '@vinejs/vine'
import { FieldOptions, Validation } from '@vinejs/vine/types'
import { DateTime } from 'luxon'
import { dateTimeRule } from '../rules/datetime.js'

export class VineDateTime extends BaseLiteralType<string, DateTime, DateTime> {
  constructor(options?: FieldOptions, validations?: Validation<any>[]) {
    super(options, validations || [dateTimeRule()])
  }

  clone() {
    return new VineDateTime(this.cloneOptions(), this.cloneValidations()) as this
  }
}
