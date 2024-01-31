import express from 'express';

import { addWorker, getWorkers, recordPayment, getPayments, issueToWorker, getPriceForIssue, getPricesForSubmit, submitFromWorker } from '../controllers/worker.js'

const router = express.Router()

router.post('/:manager_id/addworker', addWorker)
router.get('/:manager_id/getworkers', getWorkers)
router.post('/:worker_id/recordpayment', recordPayment);
router.get('/:worker_id/getpayments', getPayments);
router.post('/:worker_id/issuetoworker', issueToWorker);
router.get('/:worker_id/:design_number/getpriceforissue', getPriceForIssue);
router.get('/:worker_id/:design_number/getpricesforsubmit', getPricesForSubmit);
router.post('/:worker_id/submitfromworker', submitFromWorker);


export default router;