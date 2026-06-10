import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.middleware'
import { getSettings, saveSettings, deleteAccount } from '../controllers/settings.controller'

const router = Router()

router.use(requireAuth)

router.get('/',         getSettings)
router.put('/',         saveSettings)
router.delete('/account', deleteAccount)

export default router
