/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
// const UserAvatarsController = () => import('#controllers/user_avatars_controller')
import { middleware } from '#start/kernel'
import { forgotPasswordThrottle } from '#start/limiter'
import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')
const MissionsController = () => import('#controllers/missions_controller')
const UsersController = () => import('#controllers/users_controller')
const SwapRequestsController = () => import('#controllers/swap_requests_controller')

router.where('id', router.matchers.uuid())

/*
|------------------------------------------------
| Auth
|------------------------------------------------
*/
router
  .group(() => {
    router.post('login', [AuthController, 'login'])

    router.post('forgot-password', [AuthController, 'forgotPassword']).use(forgotPasswordThrottle)

    router.post('reset-password', [AuthController, 'resetPassword'])
    /**
     * Authenticated routes
     */
    router
      .group(() => {
        router.post('logout', [AuthController, 'logout'])

        router.post('revoke-all', [AuthController, 'revokeAllTokens'])
      })
      .use(
        middleware.auth({
          guards: ['api'],
        })
      )
  })
  .prefix('/auth')

/*
|------------------------------------------------
| Users
|------------------------------------------------
*/
router
  .group(() => {
    router.resource('users', UsersController).apiOnly()
    router.get('users/me', [UsersController, 'me'])
  })
  .use(middleware.auth({ guards: ['api'] }))

// router
//   .group(() => {
//     router.get(':id/avatar', [UserAvatarsController, 'index'])

//     router.post(':id/avatar', [UserAvatarsController, 'store'])

//     router.delete(':id/avatar', [UserAvatarsController, 'destroy'])
//   })
//   .use(middleware.auth({ guards: ['api'] }))
//   .prefix('/users')

/*
|------------------------------------------------
| Missions
|------------------------------------------------
*/
router
  .resource('missions', MissionsController)
  .apiOnly()
  .use('*', middleware.auth({ guards: ['api'] }))

/*
|------------------------------------------------
| Missions swap requests
|------------------------------------------------
*/
router
  .resource('swap-requests', SwapRequestsController)
  .apiOnly()
  .use('*', middleware.auth({ guards: ['api'] }))
