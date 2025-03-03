import User, { UserType } from '#models/user'
import { AuthorizationResponse, BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
  /**
   * Only allows office users to create other users
   * @param user the authenticated user
   * @returns true if the user is an office user, false if not.
   */
  create(user: User): AuthorizerResponse {
    if (user.type === UserType.Office) return true

    return AuthorizationResponse.deny('You are not allowed to create users')
  }

  /**
   * Only allows office users to update users, or the user itself
   * @param user the authenticated user
   * @param targetUser the user targetted by the operation
   * @returns true if the user if an office user or the user is editing himself, false if not.
   */
  update(user: User, targetUser: User): AuthorizerResponse {
    // The user is updating himself
    if (user.id === targetUser.id) return true

    // The user is an office user
    if (user.type === UserType.Office) return true

    return false
  }

  /**
   * Only allows office users to delete users, and not allowing deleting himself.
   * @param user the authenticated user, null if we want to check if the user has the global authorization to delete users
   * @param targetUser the user targeted by the operation
   * @returns `true` if the authenticated user is an office user, and different from the targeted user, `false` if not.
   */
  delete(user: User, targetUser: User | null): AuthorizerResponse {
    if (user && user.id === targetUser?.id)
      return AuthorizationResponse.deny('You cannot delete yourself', 403)

    if (user.type === UserType.Office) return true

    return false
  }
}
