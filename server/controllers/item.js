import Item from '../models/item.js'
import Proprietor from '../models/proprietor.js'
import Manager from '../models/manager.js'
import Worker from '../models/worker.js'

export const getItems = async (req, res) => {

    const proprietor_id = req.params.proprietor_id
    console.log("get items proprietor_id: ", proprietor_id)
    if (!req.proprietor || req.proprietor.proprietor_id !== proprietor_id) return res.status(401).json({ message: "Access Denied" })

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

    if (!req.proprietor || req.proprietor.proprietor_id !== proprietor_id) return res.status(401).json({ message: "Access Denied" })
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

export const getItemsForIssue = async (req, res) => {
    const manager_id = req.params.manager_id
    console.log("get items for issue manager_id: ", manager_id)

    if (!req.manager || req.manager.manager_id !== manager_id) return res.status(401).json({ message: "Access Denied" })

    try {
        const manager = await Manager.findOne({ manager_id: manager_id })

        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" })

        const items = await Item.find({ proprietor: manager.proprietor })

        const itemsForIssue = []
        console.log(manager.due_forward)
        items.forEach((item) => {
            const index = manager.due_forward.findIndex((df) => {
                console.log(df.item)
                console.log(item._id)
                return (df.item.equals(item._id) && df.quantity > 0);
            })
            console.log(index)
            if (index !== -1) {
                console.log("hi")
                console.log(manager.due_forward[index])
                itemsForIssue.push({ design_number: item.design_number, description: item.description, quantity: manager.due_forward[index].quantity })
            }
        })

        return res.status(200).json(itemsForIssue)
    }
    catch (err) {
        console.log(err)
        res.status(404).json({ message: err.message })
    }
}

export const getItemsForSubmit = async (req, res) => {
    const worker_id = req.params.worker_id
    console.log("get items for submit worker_id: ", worker_id)
    try {
        const worker = await Worker.findOne({ worker_id: worker_id }).populate({ path: 'manager', model: 'Manager', select: 'manager_id proprietor' })

        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" })

        if (!req.manager || req.manager.manager_id !== worker.manager.manager_id) return res.status(401).json({ message: "Access Denied" })

        const items = await Item.find({ proprietor: worker.manager.proprietor })

        const itemsForSubmit = []
        items.forEach((item) => {
            const index = worker.due_items.findIndex((di) => (di.item.equals(item._id) && di.quantity > 0))
            if (index !== -1) {
                itemsForSubmit.push({ design_number: item.design_number, description: item.description, quantity: worker.due_items[index].quantity })
            }
        })

        return res.status(200).json(itemsForSubmit)
    }
    catch (err) {
        console.log(err)
        res.status(404).json({ message: err.message })
    }
}

export const getItemsForFinalSubmit = async (req, res) => {
    const manager_id = req.params.manager_id
    console.log("get items for final submit manager_id: ", manager_id)
    if (!req.manager || req.manager.manager_id !== manager_id) return res.status(401).json({ message: "Access Denied" })
    try {
        const manager = await Manager.findOne({ manager_id: manager_id })

        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" })

        const items = await Item.find({ proprietor: manager.proprietor })

        const itemsForFinalSubmit = []
        items.forEach((item) => {
            const index = manager.due_backward.findIndex((df) => (df.item.equals(item._id) && df.quantity > 0))
            if (index !== -1) {
                itemsForFinalSubmit.push({ design_number: item.design_number, description: item.description, quantity: manager.due_backward[index].quantity })
            }
        })

        return res.status(200).json(itemsForFinalSubmit)
    }
    catch (err) {
        console.log(err)
        res.status(404).json({ message: err.message })
    }
}