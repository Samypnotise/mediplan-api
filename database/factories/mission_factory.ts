import factory from '@adonisjs/lucid/factories'
import Mission from '#models/mission'
import { DateTime } from 'luxon'

export const MissionFactory = factory
  .define(Mission, async ({ faker }) => {
    const start = faker.date.soon()
    const end = faker.date.soon({ refDate: start })
    return {
      title: faker.word.words({ count: { min: 3, max: 10 } }),
      patient: `${faker.person.firstName()} ${faker.person.lastName()}`,
      start: DateTime.fromJSDate(start),
      end: DateTime.fromJSDate(end),
      address: faker.location.streetAddress(true),
      latitude: 47.641362,
      longitude: 6.843235,
    }
  })
  .build()
