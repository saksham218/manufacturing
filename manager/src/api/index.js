import axios from 'axios'

const service = axios.create({
    baseURL: 'http://localhost:5000'
})

export const loginManager = (manager) => service.post('/manager/login', manager)