import Manager from "../models/manager.js";
import Proprietor from "../models/proprietor.js";
import Item from "../models/item.js";

export const addManager = async (req, res) => {
    console.log(req.body);
    const proprietor_id = req.params.proprietor_id;
    console.log("proprietor_id: ", proprietor_id);
    const { name, contact_number, address, manager_id, password } = req.body;

    try {
        const proprietor = await Proprietor.findOne({ proprietor_id: proprietor_id });
        if (!proprietor) return res.status(404).json({ message: "Proprietor doesn't exist" });
        const oldManager = await Manager.findOne({ manager_id: manager_id });
        if (oldManager) return res.status(400).json({ message: "Manager already exists" });
        const result = await Manager.create({ name, contact_number, address, manager_id, password, proprietor: proprietor._id });
        res.status(200).json({ result });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }

};

export const getManager = async (req, res) => {

    const manager_id = req.params.manager_id;
    console.log("get manager manager_id: ", manager_id);
    try {
        const manager = await Manager.findOne({ manager_id: manager_id }, { id: 0, password: 0 })
            .populate({ path: 'issue_history.item', model: 'Item', select: 'design_number description' })
            .populate({ path: 'submit_history.item', model: 'Item', select: 'design_number description' })
            .populate({ path: 'due_forward.item', model: 'Item', select: 'design_number description' })
            .populate({ path: 'due_backward.item', model: 'Item', select: 'design_number description' });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        res.status(200).json(manager);
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }

};

export const getManagers = async (req, res) => {

    const proprietor_id = req.params.proprietor_id;
    console.log("get managers proprietor_id: ", proprietor_id);

    try {

        const proprietor = await Proprietor.findOne({ proprietor_id: proprietor_id });
        if (!proprietor) return res.status(404).json({ message: "Proprietor doesn't exist" });
        //fetch only name and manager_id
        const managers = await Manager.find({ proprietor: proprietor._id }, { name: 1, manager_id: 1, _id: 0 });
        if (!managers) return res.status(404).json({ message: "No managers exist" });
        res.status(200).json(managers);
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }

};

export const recordPayment = async (req, res) => {
    console.log(req.body);
    const manager_id = req.params.manager_id;
    console.log("record payment manager_id: ", manager_id);
    const { amount, date, remarks } = req.body;

    try {
        const manager = await Manager.findOne({ manager_id: manager_id });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        const [day, month, year] = date.split('/').map(Number);
        const dateObj = new Date(year, month - 1, day);
        manager.payment_history.push({ amount: amount, date: dateObj, remarks: remarks });
        // console.log("manager: ", manager);
        await manager.save();
        res.status(200).json({ result: manager });

    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const getPayments = async (req, res) => {

    const manager_id = req.params.manager_id;
    console.log("get payments manager_id: ", manager_id);

    try {
        const manager = await Manager.findOne({ manager_id: manager_id });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        res.status(200).json(manager.payment_history);
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }

};

export const issueToManager = async (req, res) => {
    console.log(req.body);
    const manager_id = req.params.manager_id;
    console.log("issue to manager manager_id: ", manager_id);
    const { design_number, quantity } = req.body;

    try {
        const manager = await Manager.findOne({ manager_id: manager_id });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        const item = await Item.findOne({ design_number: design_number, proprietor: manager.proprietor });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });
        // const [day, month, year] = date.split('/').map(Number);
        // const dateObj = new Date(year, month - 1, day);
        const dateObj = new Date();
        manager.issue_history.push({ item: item._id, quantity: quantity, date: dateObj });
        const index = manager.due_forward.findIndex((dueItem) => dueItem.item.equals(item._id));
        if (index === -1) {
            manager.due_forward.push({ item: item._id, quantity: quantity });
        }
        else {

            manager.due_forward[index].quantity += Number(quantity);
        }
        // console.log("manager: ", manager);
        await manager.save();
        res.status(200).json({ result: manager });

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }
}


export const loginManager = async (req, res) => {
    console.log(req.body);
    const { manager_id, password } = req.body;

    try {
        const oldManager = await Manager.findOne({ manager_id });

        if (!oldManager) return res.status(404).json({ message: "Manager doesn't exist" });

        // const isPasswordCorrect = await bcrypt.compare(password, oldProprietor.password);

        const isPasswordCorrect = (password === oldManager.password);

        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

        // const token = jwt.sign({ proprietor_id: oldProprietor._id }, process.env.SECRET_KEY, { expiresIn: "1h" });

        // res.status(200).json({ result: oldProprietor, token });

        res.status(200).json({ result: oldManager });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });

        console.log(error);
    }
};
