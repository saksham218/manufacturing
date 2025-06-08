import axios from 'axios'

// const baseURL = process.env.REACT_APP_BASE_URL
const baseURL = 'http://localhost:5001'

const service = axios.create({
    baseURL: baseURL
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

service.interceptors.response.use((response) => {
    return response
}, (error) => {
    if (error.response.status === 401) {
        localStorage.removeItem('proprietor_token')
        localStorage.removeItem('proprietor')
        window.location.href = '/login'
    }
    return Promise.reject(error)
})

export const createProprietor = (newProprietor) => service.post('/proprietor/newproprietor', newProprietor)
export const loginProprietor = (proprietor) => service.post('/proprietor/login', proprietor)
export const getItems = (proprietor_id) => service.get(`/item/${proprietor_id}/getitems`)
export const createItem = (newItem, proprietor_id) => service.post(`/item/${proprietor_id}/newitem`, newItem)
export const addManager = (newManager, proprietor_id) => service.post(`/manager/${proprietor_id}/addmanager`, newManager)
export const getManager = (manager_id) => service.get(`/manager/${manager_id}/getmanager`)
export const getManagers = (proprietor_id) => service.get(`/manager/${proprietor_id}/getmanagers`)
export const recordPayment = (payment, manager_id) => service.post(`/manager/${manager_id}/recordpayment`, payment)
export const getPayments = (manager_id) => service.get(`/manager/${manager_id}/getpayments`)
export const issueToManager = (issue, manager_id) => service.post(`/manager/${manager_id}/issuetomanager`, issue)
export const issueOnHoldItemsToManager = (issue, manager_id) => service.post(`/manager/${manager_id}/issueonholditemstomanager`, issue)
export const getWorkers = (manager_id) => service.get(`/worker/${manager_id}/getworkers`)
export const getWorkerDetails = (worker_id) => service.get(`/worker/${worker_id}/workerdetails`)
export const addCustomPrice = (customPrice, worker_id) => service.post(`/worker/${worker_id}/customprice`, customPrice)
export const getSubmissions = (manager_id) => service.get(`/manager/${manager_id}/getsubmissions`)
export const acceptFromManager = (accepted, manager_id) => service.post(`/manager/${manager_id}/acceptfrommanager`, accepted)
export const getOnHoldItems = (proprietor_id) => service.get(`/proprietor/${proprietor_id}/getonholditems`)


