import express from 'express';

import { createItem, getItems } from '../controllers/item.js';

const router = express.Router();

router.get('/:proprietor_id/getitems', getItems);
router.post('/:proprietor_id/newitem', createItem);

export default router;