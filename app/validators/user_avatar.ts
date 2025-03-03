import vine from '@vinejs/vine'

export const uploadAvatarValidator = vine.compile(
  vine.object({
    avatar: vine.file({
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'heic', 'png'],
    }),
  })
)
