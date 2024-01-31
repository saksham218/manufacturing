import express from 'express';

import { createItem, getItems, getItemsForIssue, getItemsForSubmit, getItemsForFinalSubmit } from '../controllers/item.js';

const router = express.Router();

router.get('/:proprietor_id/getitems', getItems);
router.get('/:manager_id/itemsforissue', getItemsForIssue);
router.get('/:worker_id/itemsforsubmit', getItemsForSubmit);
router.get('/:manager_id/itemsforfinalsubmit', getItemsForFinalSubmit)
router.post('/:proprietor_id/newitem', createItem);

export default router;