import express from 'express';

import { newProprietor, loginProprietor, putItemsOnHold } from '../controllers/proprietor.js';
import proprietor from '../middleware/proprietor.js';
import manager from '../middleware/manager.js';

const router = express.Router();

router.post('/newproprietor', newProprietor);
router.post('/login', loginProprietor);
router.post('/:manager_id/putitemsonhold', [proprietor, manager], putItemsOnHold);



export default router;