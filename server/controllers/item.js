import Item from '../models/item.js'
import Proprietor from '../models/proprietor.js'
import Manager from '../models/manager.js'

export const getItems = async (req, res) => {

    const proprietor_id = req.params.proprietor_id
    console.log("get items proprietor_id: ", proprietor_id)
    try {
        const proprietor = await Proprietor.findOne({ proprietor_id: proprietor_id })

        if (!proprietor) return res.status(404).json({ message: "Proprietor doesn't exist" })


        const items = await Item.find({ proprietor: proprietor._id }, { _id: 0, proprietor: 0, __v: 0 })

        res.status(200).json(items)
    }
    catch (err) {
        console.log(err)
        res.status(404).json({ message: err.message })
    }
}

export const createItem = async (req, res) => {
    console.log(req.body)
    const { design_number, description, price } = req.body
    const proprietor_id = req.params.proprietor_id
    console.log("proprietor_id: ", proprietor_id)

    try {

        const proprietor = await Proprietor.findOne({ proprietor_id: proprietor_id })

        if (!proprietor) return res.status(404).json({ message: "Proprietor doesn't exist" })

        const oldItem = await Item.findOne({ design_number: design_number })

        if (oldItem) return res.status(400).json({ message: "Item already exists" })

        const newItem = new Item({ design_number, description, price, proprietor: proprietor._id, createdOn: Date.now() })


        await newItem.save()

        res.status(201).json(newItem)
    }
    catch (err) {
        res.status(409).json({ message: err.message })
    }
}

export const getItemsForManager = async (req, res) => {

    const manager_id = req.params.manager_id
    console.log("get items manager_id: ", manager_id)
    try {
        const manager = await Manager.findOne({ manager_id: manager_id })
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" })
        const items = await Item.find({ proprietor: manager.proprietor }, { _id: 0, proprietor: 0, __v: 0, price: 0, createdOn: 0 })
        res.status(200).json(items)
    }
    catch (err) {
        console.log(err)
        res.status(404).json({ message: err.message })
    }
}