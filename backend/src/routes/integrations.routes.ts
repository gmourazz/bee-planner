import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.middleware'
import {
  integrationStatus,
  googleConnect, googleCallback, googleDisconnect, googleListEvents, googleCreateEvent,
  outlookConnect, outlookCallback, outlookDisconnect, outlookCreateEvent,
} from '../controllers/integrations.controller'

const router = Router()

// Status de conexão (requer auth)
router.get('/status', requireAuth, integrationStatus)

// Google Calendar
router.get('/google/connect',  requireAuth, googleConnect)
router.get('/google/callback', googleCallback)
router.delete('/google',       requireAuth, googleDisconnect)
router.get('/google/events',   requireAuth, googleListEvents)
router.post('/google/events',  requireAuth, googleCreateEvent)

// Outlook
router.get('/outlook/connect',  requireAuth, outlookConnect)
router.get('/outlook/callback', outlookCallback)         // sem auth — callback público do OAuth
router.delete('/outlook',       requireAuth, outlookDisconnect)
router.post('/outlook/events',  requireAuth, outlookCreateEvent)

export default router
