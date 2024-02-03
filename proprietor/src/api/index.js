import axios from 'axios'

const service = axios.create({
    baseURL: 'http://localhost:5000'
})

service.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('proprietor_token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export const createProprietor = (newProprietor) => service.post('/proprietor/newproprietor', newProprietor)
export const loginProprietor = (proprietor) => service.post('/proprietor/login', proprietor)
export const getItems = (proprietor_id) => service.get(`/item/${proprietor_id}/getitems`)
export const createItem = (newItem) => service.post('/item/newitem', newItem)
export const addManager = (newManager, proprietor_id) => service.post(`/manager/${proprietor_id}/addmanager`, newManager)
export const getManager = (manager_id) => service.get(`/manager/${manager_id}/getmanager`)
export const getManagers = (proprietor_id) => service.get(`/manager/${proprietor_id}/getmanagers`)
export const recordPayment = (payment, manager_id) => service.post(`/manager/${manager_id}/recordpayment`, payment)
export const getPayments = (manager_id) => service.get(`/manager/${manager_id}/getpayments`)
export const issueToManager = (issue, manager_id) => service.post(`/manager/${manager_id}/issuetomanager`, issue)
export const getWorkers = (manager_id) => service.get(`/worker/${manager_id}/getworkers`)
export const getWorkerDetails = (worker_id) => service.get(`/worker/${worker_id}/workerdetails`)
export const addCustomPrice = (customPrice, worker_id) => service.post(`/worker/${worker_id}/customprice`, customPrice)

