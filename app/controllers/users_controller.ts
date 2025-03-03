// import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import TokenService from '#services/token_service'
import { paginationValidator } from '#validators/pagination'
import {
  createUserValidator,
  deleteUserValidator,
  getUserByIdValidator,
  updateUserValidator,
  userFilterValidator,
  userSortOptions,
} from '#validators/user'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UsersController {
  constructor(private tokenService: TokenService) {}

  /**
   * Gets the data of the currently authenticated user
   */
  async me({ auth }: HttpContext) {
    return await User.find(auth.user!.id)
  }

  async index({ request }: HttpContext) {
    const { page, limit } = await request.validateUsing(paginationValidator)
    const { search, type, sort } = await request.validateUsing(userFilterValidator)

    const sortMethod = userSortOptions.find((option) => option.id === sort) || userSortOptions[0]

    const users = await User.query()
      .if(search, (query) => {
        query.whereILike('first_name', `%${search}%`).orWhereILike('last_name', `%${search}%`)
      })
      .if(type, (query) => query.where('type', `${type}`))
      .orderBy(sortMethod.field, sortMethod.dir)
      .paginate(page || 1, limit || 10)

    return users.serialize()
  }

  /**
   * Gets an user by its id
   */
  async show({ request }: HttpContext) {
    const payload = await request.validateUsing(getUserByIdValidator)

    return await User.findOrFail(payload.params.id)
  }

  /**
   * Creates an user
   */
  async store({ request, bouncer, response }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('create')

    const payload = await request.validateUsing(createUserValidator)

    const user = await User.create({
      ...payload,
      // TODO, changeme for a more secure option
      password: '123456Az',
    })

    // We send a password reset link to the user
    await this.tokenService.createPasswordResetToken(user)

    // We return 201 when a resource is created
    return response.created(user)
  }

  /**
   * Updates an user
   */
  async update({ request, bouncer }: HttpContext): Promise<User> {
    //FIXME: validation is performed before authorization
    const payload = await request.validateUsing(updateUserValidator, {
      meta: {
        userId: request.params().id,
      },
    })

    const user = await User.findOrFail(payload.params.id)

    await bouncer.with('UserPolicy').authorize('update', user)

    const { firstName, lastName, email } = { ...payload }

    await user.merge({ firstName, lastName, email }).save()

    return user
  }

  async delete({ request, bouncer }: HttpContext): Promise<void> {
    // We firstly call the policy to check if the user has the rights to delete users
    await bouncer.with('UserPolicy').authorize('delete', null)

    const payload = await request.validateUsing(deleteUserValidator)
    const user = await User.findOrFail(payload.params.id)

    // Then, we check if the user has the rights to delete this particular user
    await bouncer.with('UserPolicy').authorize('delete', user)

    await user.delete()
  }
}
