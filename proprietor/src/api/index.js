import axios from 'axios'

const service = axios.create({
    baseURL: 'http://localhost:5000/proprietor'
})

export const createProprietor = (newProprietor) => service.post('/newproprietor', newProprietor)
export const loginProprietor = (proprietor) => service.post('/login', proprietor)

