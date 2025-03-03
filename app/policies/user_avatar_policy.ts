import User, { UserType } from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'

export default class UserAvatarPolicy extends BasePolicy {
  create(user: User, targetUser: User) {
    if (user.id === targetUser.id || user.type === UserType.Office) return true
    else return false
  }

  delete(user: User, targetUser: User) {
    if (user.id === targetUser.id || user.type === UserType.Office) return true
    else return false
  }
}
