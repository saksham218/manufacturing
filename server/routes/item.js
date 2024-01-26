import express from 'express';

import { createItem, getItems } from '../controllers/item.js';

const router = express.Router();

router.post('/getitems', getItems);
router.post('/newitem', createItem);

export default router;