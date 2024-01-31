import express from 'express';

import { addManager, getManager, getManagers, recordPayment, getPayments, issueToManager, loginManager, submitToProprietor } from '../controllers/manager.js';

const router = express.Router();

router.post('/:proprietor_id/addmanager', addManager);
router.get('/:manager_id/getmanager', getManager);
router.get('/:proprietor_id/getmanagers', getManagers);
router.post('/:manager_id/recordpayment', recordPayment);
router.get('/:manager_id/getpayments', getPayments);
router.post('/:manager_id/issuetomanager', issueToManager);
router.post('/:manager_id/submittoproprietor', submitToProprietor);
router.post('/login', loginManager);

export default router;