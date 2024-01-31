import axios from 'axios'

const service = axios.create({
    baseURL: 'http://localhost:5000'
})

export const loginManager = (manager) => service.post('/manager/login', manager)
export const addWorker = (newWorker, manager_id) => service.post(`/worker/${manager_id}/addworker`, newWorker)
export const getWorkers = (manager_id) => service.get(`/worker/${manager_id}/getworkers`)
export const recordPayment = (payment, worker_id) => service.post(`/worker/${worker_id}/recordpayment`, payment)
export const getPayments = (worker_id) => service.get(`/worker/${worker_id}/getpayments`)
export const issueToWorker = (issue, worker_id) => service.post(`/worker/${worker_id}/issuetoworker`, issue)
export const getItemsForIssue = (manager_id) => service.get(`/item/${manager_id}/itemsforissue`)
export const getPriceForIssue = (worker_id, design_number) => service.get(`/worker/${worker_id}/${design_number}/getpriceforissue`)
export const getItemsForSubmit = (worker_id) => service.get(`/item/${worker_id}/itemsforsubmit`)
export const submitFromWorker = (submission, worker_id) => service.post(`/worker/${worker_id}/submitfromworker`, submission)
export const getPricesForSubmit = (worker_id, design_number) => service.get(`/worker/${worker_id}/${design_number}/getpricesforsubmit`)