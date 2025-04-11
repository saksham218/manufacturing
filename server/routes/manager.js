import express from 'express';

import { addManager, getManager, getManagers, recordPayment, getPayments, issueToManager, issueOnHoldItemsToManager, loginManager, submitToProprietor, raiseExpenseRequest, getPricesForFinalSubmit, getSubmissions, acceptFromManager } from '../controllers/manager.js';
import proprietor from '../middleware/proprietor.js';
import manager from '../middleware/manager.js';

const router = express.Router();

router.post('/:proprietor_id/addmanager', proprietor, addManager);
router.get('/:manager_id/getmanager', [proprietor, manager], getManager);
router.get('/:proprietor_id/getmanagers', proprietor, getManagers);
router.post('/:manager_id/recordpayment', proprietor, recordPayment);
router.get('/:manager_id/getpayments', proprietor, getPayments);
router.post('/:manager_id/issuetomanager', proprietor, issueToManager);
router.post('/:manager_id/issueonholditemstomanager', proprietor, issueOnHoldItemsToManager);
router.post('/:manager_id/submittoproprietor', manager, submitToProprietor);
router.get('/:manager_id/:design_number/getpricesforfinalsubmit', manager, getPricesForFinalSubmit);
router.post('/:manager_id/raiseexpenserequest', manager, raiseExpenseRequest);
router.post('/login', loginManager);
router.get('/:manager_id/getsubmissions', proprietor, getSubmissions);
router.post('/:manager_id/acceptfrommanager', proprietor, acceptFromManager);

export default router;