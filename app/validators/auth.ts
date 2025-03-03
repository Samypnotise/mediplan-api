import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail({ all_lowercase: true }),
    password: vine.string(),
  })
)

export const forgotPasswordValidator = vine.compile(
  vine.object({ email: vine.string().email().normalizeEmail({ all_lowercase: true }) })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    password: vine.string().minLength(8),
    confirm: vine.string().sameAs('password'),
    token: vine.string(),
  })
)
