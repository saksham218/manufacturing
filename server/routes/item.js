import express from 'express';

import { createItem, getItems, getItemsForIssueToWorker, getItemsForSubmitFromWorker, getItemsForSubmitToProprietor } from '../controllers/item.js';
import proprieter from '../middleware/proprietor.js';
import manager from '../middleware/manager.js';


const router = express.Router();

router.get('/:proprietor_id/getitems', [proprieter, manager], getItems);
router.post('/:manager_id/itemsforissue', manager, getItemsForIssueToWorker);
router.post('/:worker_id/itemsforsubmitfromworker', manager, getItemsForSubmitFromWorker);
router.post('/:manager_id/itemsforsubmittoproprietor', manager, getItemsForSubmitToProprietor)
router.post('/:proprietor_id/newitem', proprieter, createItem);

export default router;