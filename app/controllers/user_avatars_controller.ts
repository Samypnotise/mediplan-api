import User from '#models/user'
import { uploadAvatarValidator } from '#validators/user_avatar'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'

export default class UserAvatarsController {
  /**
   * Display a list of resource
   */
  async index({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)

    if (!user.avatar) return response.notFound()

    return {
      url: await drive.use().getUrl(user.avatar),
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, bouncer }: HttpContext) {
    const { avatar } = await request.validateUsing(uploadAvatarValidator)
    const key = `avatars/${cuid()}.${avatar.extname}`

    const targetUser = await User.findOrFail(request.params().id)
    await bouncer.with('UserAvatarPolicy').authorize('create', targetUser)

    // If avatar already exists, we delete it
    if (targetUser.avatar) {
      await drive.use().delete(targetUser.avatar)
    }

    await avatar.moveToDisk(key)
    targetUser.avatar = key
    await targetUser.save()

    return {
      url: await drive.use().getUrl(key),
    }
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)

    if (!user.avatar) return response.notFound()
    await drive.use().delete(user.avatar)
    user.avatar = null
    await user.save()
  }
}
