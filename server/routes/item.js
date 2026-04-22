import express from 'express';

import { createItem, getItems, getItemsForIssueToWorker, getItemsForSubmitFromWorker, getItemsForSubmitFromManager } from '../controllers/item.js';
import proprieter from '../middleware/proprietor.js';
import manager from '../middleware/manager.js';


const router = express.Router();

router.get('/:proprietor_id/getitems', [proprieter, manager], getItems);
router.post('/:manager_id/itemsforissue', manager, getItemsForIssueToWorker);
router.post('/:worker_id/itemsforsubmitfromworker', manager, getItemsForSubmitFromWorker);
router.get('/:manager_id/itemsforsubmitfrommanager', manager, getItemsForSubmitFromManager)
router.post('/:proprietor_id/newitem', proprieter, createItem);

export default router;