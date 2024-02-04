import express from 'express';

import { addWorker, getWorkers, getWorker, recordPayment, getPayments, issueToWorker, getPriceForIssue, getPricesForSubmit, submitFromWorker, addCustomPrice } from '../controllers/worker.js'
import manager from '../middleware/manager.js'
import proprietor from '../middleware/proprietor.js'

const router = express.Router()

router.post('/:manager_id/addworker', manager, addWorker)
router.get('/:manager_id/getworkers', [manager, proprietor], getWorkers)
router.post('/:worker_id/recordpayment', manager, recordPayment);
router.get('/:worker_id/getpayments', manager, getPayments);
router.post('/:worker_id/issuetoworker', manager, issueToWorker);
router.get('/:worker_id/:design_number/getpriceforissue', manager, getPriceForIssue);
router.get('/:worker_id/:design_number/getpricesforsubmit', manager, getPricesForSubmit);
router.post('/:worker_id/submitfromworker', manager, submitFromWorker);
router.post('/:worker_id/customprice', proprietor, addCustomPrice)
router.get('/:worker_id/workerdetails', [manager, proprietor], getWorker)


export default router;