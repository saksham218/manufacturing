import axios from 'axios'

const service = axios.create({
    baseURL: 'http://localhost:5000'
})

export const createProprietor = (newProprietor) => service.post('/proprietor/newproprietor', newProprietor)
export const loginProprietor = (proprietor) => service.post('/proprietor/login', proprietor)
export const getItems = (proprietor) => service.post('/item/getitems', proprietor)
export const createItem = (newItem) => service.post('/item/newitem', newItem)

