import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

export default class NotFoundException extends Exception {
  static type = 'http://example.com/errors/not-found'
  static status = 404
  static code = 'E_RESOURCE_NOT_FOUND'

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).json({
      code: error.code,
      title: error.message,
      detail: error.cause,
    })
  }
}
