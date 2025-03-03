import vine, { SimpleMessagesProvider, Vine } from '@vinejs/vine'
import { VineDateTime } from '../app/schemas/datetime.js'

vine.messagesProvider = new SimpleMessagesProvider({
  // Applicable for all fields
  'required': 'The {{ field }} field is required',
  'string': 'The value of {{ field }} field must be a string',
  'email': 'The value is not a valid email address',

  // Username relative
  'firstName.alpha': 'The first name must only contain letters',
  'lastName.alpha': 'The last name must only contain letters',
  'email.database.unique': 'This email address is already used',
  'type.enum': 'The user role must be either OFFICE or CAREGIVER',

  // Id param in url
  'params.id.uuid': 'The id parameters must be a valid UUID',
})

declare module '@vinejs/vine' {
  interface Vine {
    dateTime(): VineDateTime
  }
}

Vine.macro('dateTime', function () {
  return new VineDateTime()
})
