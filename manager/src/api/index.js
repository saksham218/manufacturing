import axios from 'axios'

// const baseURL = process.env.REACT_APP_BASE_URL
const baseURL = 'http://localhost:5001'

const service = axios.create({
    baseURL: baseURL
})

service.interceptors.request.use((config) => {
    const token = localStorage.getItem('manager_token')
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
}, (error) => {
    console.log("hi")
    return Promise.reject(error)
})

//api promises, go to logout page when invalid token
service.interceptors.response.use((response) => {
    return response
}, (error) => {
    if (error.response.status === 401) {
        localStorage.removeItem('manager_token')
        localStorage.removeItem('manager')
        window.location.href = '/login'
    }
    return Promise.reject(error)
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
export const getPricesForSubmitAdhoc = (worker_id, design_number) => service.get(`/worker/${worker_id}/${design_number}/getpricesforsubmitadhoc`)
export const submitToProprietor = (submission, manager_id) => service.post(`/manager/${manager_id}/submittoproprietor`, submission)
export const getItemsForFinalSubmit = (manager_id) => service.get(`/item/${manager_id}/itemsforfinalsubmit`)
export const getPricesForFinalSubmit = (manager_id, design_number) => service.get(`/manager/${manager_id}/${design_number}/getpricesforfinalsubmit`)
export const raiseExpenseRequest = (expense, manager_id) => service.post(`/manager/${manager_id}/raiseexpenserequest`, expense)
export const getManager = (manager_id) => service.get(`/manager/${manager_id}/getmanager`)
export const getWorkerDetails = (worker_id) => service.get(`/worker/${worker_id}/workerdetails`)
export const getItems = (proprietor_id) => service.get(`/item/${proprietor_id}/getitems`)