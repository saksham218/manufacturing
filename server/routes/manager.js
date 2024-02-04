import express from 'express';

import { addManager, getManager, getManagers, recordPayment, getPayments, issueToManager, loginManager, submitToProprietor } from '../controllers/manager.js';
import proprietor from '../middleware/proprietor.js';
import manager from '../middleware/manager.js';

const router = express.Router();

router.post('/:proprietor_id/addmanager', proprietor, addManager);
router.get('/:manager_id/getmanager', [proprietor, manager], getManager);
router.get('/:proprietor_id/getmanagers', proprietor, getManagers);
router.post('/:manager_id/recordpayment', proprietor, recordPayment);
router.get('/:manager_id/getpayments', proprietor, getPayments);
router.post('/:manager_id/issuetomanager', proprietor, issueToManager);
router.post('/:manager_id/submittoproprietor', manager, submitToProprietor);
router.post('/login', loginManager);

export default router;