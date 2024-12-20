import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Manager from "../models/manager.js";
import Worker from "../models/worker.js";
import Proprietor from "../models/proprietor.js";
import Item from "../models/item.js";

export const addManager = async (req, res) => {
    console.log(req.body);
    const proprietor_id = req.params.proprietor_id;
    console.log("proprietor_id: ", proprietor_id);
    const { name, contact_number, address, manager_id, password } = req.body;

    if (!req.proprietor || req.proprietor.proprietor_id !== proprietor_id) return res.status(401).json({ message: "Access Denied" });

    try {
        const proprietor = await Proprietor.findOne({ proprietor_id: proprietor_id });
        if (!proprietor) return res.status(404).json({ message: "Proprietor doesn't exist" });
        const oldManager = await Manager.findOne({ manager_id: manager_id });
        if (oldManager) return res.status(400).json({ message: "Manager already exists" });

        const hashedPassword = await bcrypt.hash(password, 12);
        const result = await Manager.create({ name, contact_number, address, manager_id, password: hashedPassword, proprietor: proprietor._id });


        return res.status(200).json({ name: result.name, manager_id: result.manager_id });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }

};

export const getManager = async (req, res) => {

    const manager_id = req.params.manager_id;
    console.log("get manager manager_id: ", manager_id);
    console.log("manager:", req.manager);
    console.log("proprietor:", req.proprietor);
    if (((!req.manager || !req.manager.manager_id) && (!req.proprietor || !req.proprietor.proprietor_id)) || (req.manager && req.manager.manager_id && manager_id !== req.manager.manager_id)) return res.status(401).json({ message: "Access Denied" });
    try {
        const manager = await Manager.findOne({ manager_id: manager_id }, { id: 0, password: 0 })
            .populate([
                { path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' },
                { path: 'issue_history.item', model: 'Item', select: 'design_number description' },
                { path: 'accepted_history.worker', model: 'Worker', select: 'name worker_id' },
                { path: 'accepted_history.items.item', model: 'Item', select: 'design_number description' },
                { path: 'due_forward.item', model: 'Item', select: 'design_number description' },
                { path: 'due_backward.worker', model: 'Worker', select: 'name worker_id' },
                { path: 'due_backward.items.item', model: 'Item', select: 'design_number description' },
                { path: 'submissions.worker', model: 'Worker', select: 'name worker_id' },
                { path: 'submissions.items.item', model: 'Item', select: 'design_number description' },
                { path: 'total_due.item', model: 'Item', select: 'design_number description' }]);

        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });

        if (req.proprietor && req.proprietor.proprietor_id && manager.proprietor.proprietor_id !== req.proprietor.proprietor_id) {
            console.log(req.proprietor);
            console.log(manager.proprietor);
            return res.status(401).json({ message: "Access Denied" });
        }

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

    if (!req.proprietor || req.proprietor.proprietor_id !== proprietor_id) return res.status(401).json({ message: "Access Denied" });

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
        const manager = await Manager.findOne({ manager_id: manager_id }).populate({ path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        if (!req.proprietor || req.proprietor.proprietor_id !== manager.proprietor.proprietor_id) return res.status(401).json({ message: "Access Denied" });
        const [day, month, year] = date.split('/').map(Number);
        const dateObj = new Date(year, month - 1, day);
        manager.payment_history.push({ amount: amount, date: dateObj, remarks: remarks });
        manager.due_amount -= Number(amount);
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
        const manager = await Manager.findOne({ manager_id: manager_id }).populate({ path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        if (!req.proprietor || req.proprietor.proprietor_id !== manager.proprietor.proprietor_id) return res.status(401).json({ message: "Access Denied" });
        return res.status(200).json({ payment_history: manager.payment_history, due_amount: manager.due_amount });
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
    const { design_number, quantity, underprocessing_value, general_price, remarks } = req.body;

    try {
        const manager = await Manager.findOne({ manager_id: manager_id }).populate({ path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        if (!req.proprietor || req.proprietor.proprietor_id !== manager.proprietor.proprietor_id) {
            console.log(req.proprietor.proprietor_id);
            console.log(manager.proprietor.proprietor_id);
            return res.status(401).json({ message: "Access Denied" });
        }

        const item = await Item.findOne({ design_number: design_number, proprietor: manager.proprietor });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });
        if (item.price !== Number(general_price)) return res.status(400).json({ message: "General price doesn't match" });
        // const [day, month, year] = date.split('/').map(Number);
        // const dateObj = new Date(year, month - 1, day);
        const dateObj = new Date();
        manager.issue_history.push({ item: item._id, quantity: quantity, underprocessing_value: underprocessing_value, general_price: general_price, remarks_from_proprietor: remarks, date: dateObj });

        // const df_index = manager.due_forward.findIndex((dueItem) => dueItem.item.equals(item._id));
        // if (df_index === -1) {
        //     manager.due_forward.push({ item: item._id, quantity: quantity, });
        // }
        // else {
        //     manager.due_forward[df_index].quantity += Number(quantity);
        // }

        manager.due_forward.push({ item: item._id, quantity: quantity, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks });

        if (remarks === "") {
            const td_index = manager.total_due.findIndex((dueItem) => (dueItem.item.equals(item._id) && dueItem.remarks_from_proprietor === "" && dueItem.underprocessing_value === Number(underprocessing_value)));
            if (td_index === -1) {
                manager.total_due.push({ item: item._id, quantity: quantity, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks });
            }
            else {
                manager.total_due[td_index].quantity += Number(quantity);
            }
        }
        else {
            manager.total_due.push({ item: item._id, quantity: quantity, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks });
        }

        // console.log("manager: ", manager);
        await manager.save();
        return res.status(200).json({ result: manager });

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }
}


export const submitToProprietor = async (req, res) => {
    console.log(req.body);
    const manager_id = req.params.manager_id;
    console.log("submit to proprietor manager_id: ", manager_id);
    const { worker_id, design_number, submit_quantity, price, deduction_from_manager, remarks_from_manager, underprocessing_value, remarks_from_proprietor, is_adhoc } = req.body;

    if (!req.manager || req.manager.manager_id !== manager_id) return res.status(401).json({ message: "Access Denied" });

    try {
        const manager = await Manager.findOne({ manager_id: manager_id });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });

        const worker = await Worker.findOne({ worker_id: worker_id, manager: manager._id });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });

        const item = await Item.findOne({ design_number: design_number, proprietor: manager.proprietor });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });
        // const [day, month, year] = date.split('/').map(Number);
        // const dateObj = new Date(year, month - 1, day);


        // const tdIndex = manager.total_due.findIndex((dueItem) => (dueItem.item.equals(item._id) && dueItem.quantity >= Number(quantity) && dueItem.remarks_from_proprietor === remarks_from_proprietor && dueItem.underprocessing_value === Number(underprocessing_value)));
        // if (tdIndex === -1) {
        //     return res.status(404).json({ message: `${quantity} of ${design_number} with underprocessing value: ${underprocessing_value} and remarks from proprietor: ${remarks_from_proprietor} not issued to ${manager_id}` });
        // }
        // else {
        //     manager.total_due[tdIndex].quantity -= Number(quantity);
        //     if (manager.total_due[tdIndex].quantity === 0) {
        //         manager.total_due.splice(tdIndex, 1);
        //     }
        // }

        const dbWorkerIndex = manager.due_backward.findIndex((w) => w.worker.equals(worker._id));
        if (dbWorkerIndex === -1) {
            return res.status(404).json({ message: `no goods due backward for worker: ${worker_id}` });
        }
        else {
            const dbItemIndex = manager.due_backward[dbWorkerIndex].items.findIndex((i) => (i.item.equals(item._id) && i.quantity >= Number(submit_quantity) && i.price === Number(price) && i.deduction_from_manager === Number(deduction_from_manager) && i.remarks_from_manager === remarks_from_manager && i.remarks_from_proprietor === remarks_from_proprietor && Number(i.underprocessing_value) === Number(underprocessing_value) && (i.is_adhoc === is_adhoc)));
            if (dbItemIndex === -1) {
                return res.status(404).json({ message: `${submit_quantity} of ${design_number} and is_adhoc: ${is_adhoc} not due backward at manager: ${manager_id}, made by worker: ${worker_id} with price: ${price}, deduction from manager: ${deduction_from_manager} and remarks from manager: ${remarks_from_manager}, remarks from proprietor: ${remarks_from_proprietor} and underprocessing value: ${underprocessing_value}` });
            }
            else {
                manager.due_backward[dbWorkerIndex].items[dbItemIndex].quantity -= Number(submit_quantity);
                if (manager.due_backward[dbWorkerIndex].items[dbItemIndex].quantity === 0) {
                    manager.due_backward[dbWorkerIndex].items.splice(dbItemIndex, 1);
                }

                if (manager.due_backward[dbWorkerIndex].items.length === 0) {
                    manager.due_backward.splice(dbWorkerIndex, 1);
                }

            }
        }


        // manager.due_amount += (1.1 * (Number(price) - Number(deduction)) * Number(quantity));

        let sWorkerIndex = manager.submissions.findIndex((s) => s.worker.equals(worker._id));
        if (sWorkerIndex === -1) {
            manager.submissions.push({ worker: worker._id, items: [] });
            sWorkerIndex = manager.submissions.length - 1;
        }

        if (Number(deduction_from_manager) !== 0 || remarks_from_manager !== "" || remarks_from_proprietor !== "") {
            manager.submissions[sWorkerIndex].items.push({ item: item._id, quantity: Number(submit_quantity), price: Number(price), deduction_from_manager: Number(deduction_from_manager), remarks_from_manager: remarks_from_manager, remarks_from_proprietor: remarks_from_proprietor, underprocessing_value: underprocessing_value, date: new Date(), is_adhoc: is_adhoc });
        }
        else {
            let sItemIndex = manager.submissions[sWorkerIndex].items.findIndex((i) => (i.item.equals(item._id) && i.price === Number(price) && i.deduction_from_manager === Number(deduction_from_manager) && i.remarks_from_manager === remarks_from_manager && i.remarks_from_proprietor === remarks_from_proprietor && Number(i.underprocessing_value) === Number(underprocessing_value) && is_adhoc === i.is_adhoc));
            if (sItemIndex === -1) {
                manager.submissions[sWorkerIndex].items.push({ item: item._id, quantity: Number(submit_quantity), price: Number(price), deduction_from_manager: Number(deduction_from_manager), remarks_from_manager: remarks_from_manager, remarks_from_proprietor: remarks_from_proprietor, underprocessing_value: underprocessing_value, date: new Date(), is_adhoc: is_adhoc });
            }
            else {
                manager.submissions[sWorkerIndex].items[sItemIndex].quantity += Number(submit_quantity);
            }
        }

        // console.log("manager: ", manager);
        await manager.save();
        return res.status(200).json({ result: manager });

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }
}


export const raiseExpenseRequest = async (req, res) => {
    console.log(req.body);
    const manager_id = req.params.manager_id;
    console.log(`raise expense request manager_id: ${manager_id}`);
    const { amount, remarks } = req.body;

    if (!req.manager || req.manager.manager_id !== manager_id) return res.status(401).json({ message: "Access Denied" });

    try {
        const manager = await Manager.findOne({ manager_id: manager_id });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });

        const dateObj = new Date();
        if (!manager.expense_requests)
            manager.expense_requests = [];
        manager.expense_requests.push({ amount: amount, remarks: remarks, date: dateObj });
        manager.due_amount += Number(amount);
        // console.log("manager: ", manager);
        await manager.save();
        return res.status(200).json({ result: manager });

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Something went wrong" });
    }
}



export const loginManager = async (req, res) => {
    console.log(req.body);
    const { manager_id, password } = req.body;
    console.log(req.headers.authorization)

    try {
        const oldManager = await Manager.findOne({ manager_id }, { password: 1, name: 1, manager_id: 1 }).populate({ path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' });

        if (!oldManager) return res.status(404).json({ message: "Manager doesn't exist" });

        const isPasswordCorrect = await bcrypt.compare(password, oldManager.password);

        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

        const manager_token = jwt.sign({ manager_id: oldManager.manager_id }, process.env.SECRET_KEY, { expiresIn: "1h" });

        // res.status(200).json({ result: oldProprietor, token });
        // const result = { manager_id: oldManager.manager_id, name: oldManager.name, token: token };
        return res.status(200).json({ result: { manager_id: oldManager.manager_id, name: oldManager.name, proprietor_id: oldManager.proprietor.proprietor_id }, manager_token });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });

    }
};

export const getPricesForFinalSubmit = async (req, res) => {
    const manager_id = req.params.manager_id;
    const design_number = req.params.design_number;
    console.log(`get prices for final submit manager_id: ${manager_id} design_number: ${design_number}`);

    if (!req.manager || req.manager.manager_id !== manager_id) return res.status(401).json({ message: "Access Denied" });

    try {
        const manager = await Manager.findOne({ manager_id: manager_id });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        const item = await Item.findOne({ design_number: design_number, proprietor: manager.proprietor });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });
        const prices = manager.due_backward.filter((db) => db.item.equals(item._id)).map((db) => ({ quantity: db.quantity, price: db.price, deduction: db.deduction ? db.deduction : 0, remarks: db.remarks }));
        res.status(200).json(prices);
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const getSubmissions = async (req, res) => {
    const manager_id = req.params.manager_id;
    console.log(`get submissions manager_id: ${manager_id}`);

    try {
        const manager = await Manager.findOne({ manager_id: manager_id }).select('submissions proprietor').populate([
            { path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' },
            { path: 'submissions.worker', model: 'Worker', select: 'name worker_id' },
            { path: 'submissions.items.item', model: 'Item', select: 'design_number description' }
        ]);

        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        if (!req.proprietor || req.proprietor.proprietor_id !== manager.proprietor.proprietor_id) return res.status(401).json({ message: "Access Denied" });
        res.status(200).json(manager.submissions);
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const acceptFromManager = async (req, res) => {
    console.log(req.body);
    const manager_id = req.params.manager_id;
    console.log(`accept from manager manager_id: ${manager_id}`);
    const { worker_id, design_number, price, deduction_from_manager, remarks_from_manager, underprocessing_value, remarks_from_proprietor, accept_quantity, deduction, final_remarks, is_adhoc } = req.body;

    try {
        const manager = await Manager.findOne({ manager_id: manager_id }).select('submissions accepted_history total_due proprietor due_amount').populate([
            { path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' }
        ]);
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });

        if (!req.proprietor || req.proprietor.proprietor_id !== manager.proprietor.proprietor_id) return res.status(401).json({ message: "Access Denied" });

        const worker = await Worker.findOne({ worker_id: worker_id, manager: manager._id });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });

        const item = await Item.findOne({ design_number: design_number, proprietor: manager.proprietor });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });
        // const [day, month, year] = date.split('/').map(Number);
        // const dateObj = new Date(year, month - 1, day);
        const tdIndex = manager.total_due.findIndex((td) => (td.item.equals(item._id) && td.quantity >= Number(accept_quantity) && td.remarks_from_proprietor === remarks_from_proprietor && Number(td.underprocessing_value) === Number(underprocessing_value) && td.is_adhoc === is_adhoc));
        if (tdIndex === -1) {
            return res.status(404).json({ message: `${accept_quantity} of ${design_number} and is_adhoc: ${is_adhoc} with underprocessing value: ${underprocessing_value} and remarks from proprietor: ${remarks_from_proprietor} not due at manager: ${manager_id}` });
        }

        const sWorkerIndex = manager.submissions.findIndex((w) => w.worker.equals(worker._id));
        if (sWorkerIndex === -1) {
            return res.status(404).json({ message: `no goods made by worker: ${worker_id} are in submissions` });
        }

        const sItemIndex = manager.submissions[sWorkerIndex].items.findIndex((i) => (i.item.equals(item._id) && i.quantity >= Number(accept_quantity) && i.price === Number(price) && i.deduction_from_manager === Number(deduction_from_manager) && i.remarks_from_manager === remarks_from_manager && i.remarks_from_proprietor === remarks_from_proprietor && Number(i.underprocessing_value) === Number(underprocessing_value) && i.is_adhoc === is_adhoc));
        if (sItemIndex === -1) {
            return res.status(404).json({ message: `${accept_quantity} of ${design_number} and is_adhoc: ${is_adhoc} not submiited by manager: ${manager_id}, made by worker: ${worker_id} with price: ${price}, deduction from manager: ${deduction_from_manager}, remarks from manager: ${remarks_from_manager}, remarks from proprietor: ${remarks_from_proprietor} and underprocessing value: ${underprocessing_value}` });
        }

        if (Number(accept_quantity) <= 0) {
            return res.status(400).json({ message: "Accept quantity should be positive" });
        }
        if (Number(deduction) > (Number(manager.submissions[sWorkerIndex].items[sItemIndex].price) - Number(manager.submissions[sWorkerIndex].items[sItemIndex].deduction_from_manager))) {
            return res.status(400).json({ message: "Deduction can't be more than the price (remaining after deduction_from_manager)" });
        }

        if (Number(deduction) !== 0 && final_remarks === "") {
            return res.status(400).json({ message: "Final remarks are required if deduction is made by proprietor" });
        }


        manager.submissions[sWorkerIndex].items[sItemIndex].quantity -= Number(accept_quantity);
        if (manager.submissions[sWorkerIndex].items[sItemIndex].quantity === 0) {
            manager.submissions[sWorkerIndex].items.splice(sItemIndex, 1);
        }

        if (manager.submissions[sWorkerIndex].items.length === 0) {
            manager.submissions.splice(sWorkerIndex, 1);
        }


        let ahWorkerIndex = manager.accepted_history.findIndex((w) => w.worker.equals(worker._id));
        if (ahWorkerIndex === -1) {
            manager.accepted_history.push({ worker: worker._id, items: [] });
            ahWorkerIndex = manager.accepted_history.length - 1;
        }

        if (Number(deduction) !== 0 || final_remarks !== "") {
            manager.accepted_history[ahWorkerIndex].items.push({ item: item._id, quantity: Number(accept_quantity), price: Number(price), deduction_from_manager: Number(deduction_from_manager), remarks_from_manager: remarks_from_manager, underprocessing_value: Number(underprocessing_value), remarks_from_proprietor: remarks_from_proprietor, deduction_from_proprietor: Number(deduction), final_remarks_from_proprietor: final_remarks, date: new Date(), is_adhoc: is_adhoc });
        }
        else {

            const ahItemIndex = manager.accepted_history[ahWorkerIndex].items.findIndex((i) => (i.item.equals(item._id) && i.price === Number(price) && i.deduction_from_manager === Number(deduction_from_manager) && i.remarks_from_manager === remarks_from_manager && i.remarks_from_proprietor === remarks_from_proprietor && Number(i.underprocessing_value) === Number(underprocessing_value) && i.deduction_from_proprietor === Number(deduction) && i.final_remarks_from_proprietor === final_remarks && i.is_adhoc === is_adhoc));
            if (ahItemIndex === -1) {
                manager.accepted_history[ahWorkerIndex].items.push({ item: item._id, quantity: Number(accept_quantity), price: Number(price), deduction_from_manager: Number(deduction_from_manager), remarks_from_manager: remarks_from_manager, underprocessing_value: Number(underprocessing_value), remarks_from_proprietor: remarks_from_proprietor, deduction_from_proprietor: Number(deduction), final_remarks_from_proprietor: final_remarks, date: new Date() });
            }
            else {
                manager.accepted_history[ahWorkerIndex].items[ahItemIndex].quantity += Number(accept_quantity);
            }
        }

        manager.total_due[tdIndex].quantity -= Number(accept_quantity);
        if (manager.total_due[tdIndex].quantity === 0) {
            manager.total_due.splice(tdIndex, 1);
        }

        manager.due_amount += (1.1 * (Number(price) - Number(deduction) - Number(deduction_from_manager)) * Number(accept_quantity));

        await manager.save();

        if (Number(deduction) !== 0) {
            worker.due_amount -= (Number(accept_quantity) * Number(deduction));
            worker.deductions_from_proprietor.push({ item: item._id, price: price, quantity: accept_quantity, deduction_from_proprietor: deduction, final_remarks_from_proprietor: final_remarks, deduction_from_manager: deduction_from_manager, deduction_date: new Date(), remarks_from_manager: remarks_from_manager, remarks_from_proprietor: remarks_from_proprietor, is_adhoc: is_adhoc });
            await worker.save();
        }

        return res.status(200).json({ result: manager });



    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }
}
