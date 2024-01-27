import Item from '../models/item.js'
import Proprietor from '../models/proprietor.js'

export const getItems = async (req, res) => {

    const proprietor_id = req.params.proprietor_id
    console.log("proprietor_id: ", proprietor_id)
    try {
        const proprietor = await Proprietor.findOne({ proprietor_id: proprietor_id })

        if (!proprietor) return res.status(404).json({ message: "Proprietor doesn't exist" })


        const items = await Item.find({ proprietor: proprietor._id })

        res.status(200).json(items)
    }
    catch (err) {
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