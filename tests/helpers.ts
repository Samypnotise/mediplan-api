import { getActiveTest } from '@japa/runner'
import timekeeper from 'timekeeper'

export interface Duration {
  hours?: number
  minutes?: number
  seconds?: number
}

export function timeTravel(seconds: number) {
  const test = getActiveTest()
  if (!test) throw new Error('Cannot use "timetravel" outside of a Japa test')

  timekeeper.reset()

  const date = new Date()
  date.setSeconds(date.getSeconds() + seconds)
  timekeeper.travel(date)

  test.cleanup(() => {
    timekeeper.reset
  })
}
