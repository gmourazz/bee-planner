import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.middleware'
import { listarLogs, upsertLog } from '../controllers/health.controller'

const router = Router()

router.use(requireAuth)

router.get('/',         listarLogs) // ?since=YYYY-MM-DD
router.put('/:date',    upsertLog)  // upsert do dia (YYYY-MM-DD)

export default router
