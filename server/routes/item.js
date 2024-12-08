import express from 'express';

import { createItem, getItems, getItemsForIssue, getItemsForSubmit, getItemsForFinalSubmit } from '../controllers/item.js';
import proprieter from '../middleware/proprietor.js';
import manager from '../middleware/manager.js';


const router = express.Router();

router.get('/:proprietor_id/getitems', [proprieter,manager], getItems);
router.get('/:manager_id/itemsforissue', manager, getItemsForIssue);
router.get('/:worker_id/itemsforsubmit', manager, getItemsForSubmit);
router.get('/:manager_id/itemsforfinalsubmit', manager, getItemsForFinalSubmit)
router.post('/:proprietor_id/newitem', proprieter, createItem);

export default router;