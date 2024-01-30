import express from 'express';

import { createItem, getItems, getItemsForManager } from '../controllers/item.js';

const router = express.Router();

router.get('/:proprietor_id/getitems', getItems);
router.get('/:manager_id/itemsformanager', getItemsForManager);
router.post('/:proprietor_id/newitem', createItem);

export default router;