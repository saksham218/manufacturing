import express from 'express';

import { addManager, getManager, getManagers, recordPayment, getPayments } from '../controllers/manager.js';

const router = express.Router();

router.post('/:proprietor_id/addmanager', addManager);
router.get('/:manager_id/getmanager', getManager);
router.get('/:proprietor_id/getmanagers', getManagers);
router.post('/:manager_id/recordpayment', recordPayment);
router.get('/:manager_id/getpayments', getPayments);

export default router;