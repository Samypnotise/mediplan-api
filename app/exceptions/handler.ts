import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors as authErrors } from '@adonisjs/auth'
import { errors as bouncerErrors } from '@adonisjs/bouncer'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    ctx.response.safeHeader('Content-type', 'application/problem+json')

    /**
     * Handling authentication errors
     */
    if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
      return ctx.response.status(error.status).json({
        code: error.code,
        title: error.message,
        detail: error.cause,
      })
    }

    if (error instanceof bouncerErrors.E_AUTHORIZATION_FAILURE) {
      return ctx.response.status(error.status).json({
        code: error.code,
        title: error.getResponseMessage(ctx),
        detail: error.cause,
      })
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
