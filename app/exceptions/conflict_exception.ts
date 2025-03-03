import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

export default class ConflictException extends Exception {
  static status = 409
  static code = 'E_CONFLICT'

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).json({
      code: error.code,
      title: error.message,
      detail: error.cause,
    })
  }
}
