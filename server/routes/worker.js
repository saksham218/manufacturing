import express from 'express';

import { addWorker, getWorkers, recordPayment, getPayments, issueToWorker, getPrice } from '../controllers/worker.js'

const router = express.Router()

router.post('/:manager_id/addworker', addWorker)
router.get('/:manager_id/getworkers', getWorkers)
router.post('/:worker_id/recordpayment', recordPayment);
router.get('/:worker_id/getpayments', getPayments);
router.post('/:worker_id/issuetoworker', issueToWorker);
router.get('/:worker_id/:design_number/getprice', getPrice);


export default router;