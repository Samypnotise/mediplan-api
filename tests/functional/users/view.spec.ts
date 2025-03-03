import { test } from '@japa/runner'

test.group('Users view', () => {
  test('route needs authentication', async ({ client }) => {
    const response = await client.get('users/me')

    response.assertStatus(401)
  })
})
