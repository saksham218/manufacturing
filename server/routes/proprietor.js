import express from 'express';

import { newProprietor, loginProprietor } from '../controllers/proprietor.js';

const router = express.Router();

router.post('/newproprietor', newProprietor);
router.post('/login', loginProprietor);



export default router;