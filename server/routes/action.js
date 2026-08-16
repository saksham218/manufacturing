import express from 'express';
import manager from '../middleware/manager.js';
import proprietor from '../middleware/proprietor.js';
import { getActions, undoAction } from '../controllers/action.js';

const router = express.Router();

router.post('/', [manager, proprietor], getActions);
router.post('/:action_id/undo', [manager, proprietor], undoAction);

export default router;
