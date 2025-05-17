import express from 'express';

import { newProprietor, loginProprietor, getOnHoldItems } from '../controllers/proprietor.js';
import proprietor from '../middleware/proprietor.js';

const router = express.Router();

router.post('/newproprietor', newProprietor);
router.post('/login', loginProprietor);
router.get('/:proprietor_id/getonholditems', proprietor, getOnHoldItems);



export default router;