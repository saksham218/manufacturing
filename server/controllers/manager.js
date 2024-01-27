import Manager from "../models/manager.js";
import Proprietor from "../models/proprietor.js";

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
    try {
        const manager = await Manager.findOne({ manager_id: manager_id },
            { name: 1, manager_id: 1, _id: 0, password: 0, issue_history: 1, submit_history: 1, due_forward: 1, due_backward: 1 });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        res.status(200).json({ result: manager });
    }
    catch (error) {
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