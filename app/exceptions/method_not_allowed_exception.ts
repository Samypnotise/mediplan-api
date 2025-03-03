import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

export default class MethodNotAllowedException extends Exception {
  static status = 405
  static code = 'E_METHOD_NOT_ALLOWED'

  constructor(
    private allowedMethods: string[],
    message?: string,
    options?: ErrorOptions & {
      code?: string
      status?: number
    }
  ) {
    super(message, options)
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response.append('Allow', `${this.allowedMethods?.toString()}`).status(error.status).json({
      code: error.code,
      title: error.message,
      detail: error.cause,
    })
  }
}
