import emitter from '@adonisjs/core/services/emitter'
import SwapRequestAccepted from '#events/swap_request_accepted'

emitter.listen(SwapRequestAccepted, [() => import('#listeners/expire_other_requests')])
