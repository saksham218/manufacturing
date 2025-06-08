import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Manager from "../models/manager.js";
import Worker from "../models/worker.js";
import Proprietor from "../models/proprietor.js";
import Item from "../models/item.js";
import { depopulateHoldInfo, isSameDay, isSameHoldInfo, managerPopulatePaths, prepare } from "../utils/utils.js";

export const addManager = async (req, res) => {
    console.log(req.body);
    const proprietor_id = req.params.proprietor_id;
    console.log("proprietor_id: ", proprietor_id);
    const { name, contact_number, address, manager_id, password } = req.body;

    if (!req.proprietor || req.proprietor.proprietor_id !== proprietor_id) return res.status(403).json({ message: "Access Denied" });

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
    if (((!req.manager || !req.manager.manager_id) && (!req.proprietor || !req.proprietor.proprietor_id)) || (req.manager && req.manager.manager_id && manager_id !== req.manager.manager_id)) return res.status(403).json({ message: "Access Denied" });
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
                { path: 'total_due.item', model: 'Item', select: 'design_number description' },
                { path: 'forfeited_history.worker', model: 'Worker', select: 'name worker_id' },
                { path: 'forfeited_history.items.item', model: 'Item', select: 'design_number description' },
                { path: 'on_hold_history.worker', model: 'Worker', select: 'name worker_id' },
                { path: 'on_hold_history.items.item', model: 'Item', select: 'design_number description' },
            ]).lean();

        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });

        if (req.proprietor && req.proprietor.proprietor_id && manager.proprietor.proprietor_id !== req.proprietor.proprietor_id) {
            console.log(req.proprietor);
            console.log(manager.proprietor);
            return res.status(403).json({ message: "Access Denied" });
        }

        const managerPrepared = await prepare(managerPopulatePaths, manager, true)
        // console.log(JSON.stringify(managerPrepared))

        res.status(200).json(managerPrepared);
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }

};

export const getManagers = async (req, res) => {

    const proprietor_id = req.params.proprietor_id;
    console.log("get managers proprietor_id: ", proprietor_id);

    if (!req.proprietor || req.proprietor.proprietor_id !== proprietor_id) return res.status(403).json({ message: "Access Denied" });

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
        if (!req.proprietor || req.proprietor.proprietor_id !== manager.proprietor.proprietor_id) return res.status(403).json({ message: "Access Denied" });
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
        if (!req.proprietor || req.proprietor.proprietor_id !== manager.proprietor.proprietor_id) return res.status(403).json({ message: "Access Denied" });
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
    if (!req.proprietor || !req.proprietor.proprietor_id) return res.status(403).json({ message: "Access Denied" });
    const proprietor_id = req.proprietor.proprietor_id;
    try {
        const manager = await Manager.findOne({ manager_id: manager_id }).populate({ path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        if (proprietor_id !== manager.proprietor.proprietor_id) {
            console.log(proprietor_id);
            console.log(manager.proprietor.proprietor_id);
            return res.status(403).json({ message: "Access Denied" });
        }

        const item = await Item.findOne({ design_number: design_number, proprietor: manager.proprietor });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });

        if (Number(quantity) <= 0) return res.status(400).json({ message: "Quantity should be positive" });

        if (item.price !== Number(general_price)) return res.status(400).json({ message: "General price doesn't match" });
        // const [day, month, year] = date.split('/').map(Number);
        // const dateObj = new Date(year, month - 1, day);
        const dateObj = new Date();
        manager.issue_history.push({ item: item._id, quantity: quantity, underprocessing_value: underprocessing_value, general_price: general_price, remarks_from_proprietor: remarks, date: dateObj });

        // const df_index = manager.due_forward.findIndex((dueItem) => dueItem.item.equals(item._id) && dueunderprocessing_value === Number(underprocessing_value) && dueItem.remarks_from_proprietor === remarks);
        // if (df_index === -1) {
        //     manager.due_forward.push({ item: item._id, quantity: quantity, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks });
        // }
        // else {
        //     manager.due_forward[df_index].quantity += Number(quantity);
        // }

        // manager.due_forward.push({ item: item._id, quantity: quantity, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks });

        if (remarks === "") {
            const td_index = manager.total_due.findIndex((dueItem) => (dueItem.item.equals(item._id) && dueItem.remarks_from_proprietor === "" && dueItem.underprocessing_value === Number(underprocessing_value)));
            if (td_index === -1) {
                manager.total_due.push({ item: item._id, quantity: quantity, underprocessing_value: underprocessing_value, remarks_from_proprietor: "" });
            }
            else {
                manager.total_due[td_index].quantity += Number(quantity);
            }

            const df_index = manager.due_forward.findIndex((dueItem) => (dueItem.item.equals(item._id) && dueItem.remarks_from_proprietor === "" && dueItem.underprocessing_value === Number(underprocessing_value)));

            if (df_index === -1) {
                manager.due_forward.push({ item: item._id, quantity: quantity, underprocessing_value: underprocessing_value, remarks_from_proprietor: "" });
            }
            else {
                manager.due_forward[df_index].quantity += Number(quantity);
            }

        }
        else {
            manager.total_due.push({ item: item._id, quantity: quantity, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks });
            manager.due_forward.push({ item: item._id, quantity: quantity, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks });
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

export const issueOnHoldItemsToManager = async (req, res) => {
    console.log(req.body);
    const new_manager_id = req.params.manager_id;
    console.log("issue on hold items to manager manager_id: ", new_manager_id);
    console.log("proprietor: ", req.proprietor);
    if (!req.proprietor || !req.proprietor.proprietor_id) return res.status(403).json({ message: "Access Denied" });
    const proprietor_id = req.proprietor.proprietor_id;
    const { design_number, quantity, new_price, new_underprocessing_value, new_remarks_from_proprietor, price, partial_payment, underprocessing_value, remarks_from_proprietor, deduction_from_manager, remarks_from_manager, hold_date, put_on_hold_by, holding_remarks, is_adhoc, worker_id, manager_id, hold_info } = req.body;
    try {

        const newManager = await Manager.findOne({ manager_id: new_manager_id }, { id: 0, password: 0 }).populate({ path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' });
        if (!newManager) return res.status(404).json({ message: "Manager doesn't exist" });

        if (newManager.proprietor.proprietor_id !== proprietor_id) {
            console.log(req.proprietor.proprietor_id);
            console.log(newManager.proprietor.proprietor_id);
            return res.status(403).json({ message: "Access Denied" });
        }

        const proprietor = await Proprietor.findOne({ proprietor_id: proprietor_id }, { id: 0, password: 0 });
        if (!proprietor) return res.status(404).json({ message: "Proprietor doesn't exist" });

        const manager = await Manager.findOne({ manager_id: manager_id }, { id: 0, password: 0 }).populate({ path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });

        if (proprietor_id !== manager.proprietor.proprietor_id) {
            console.log(req.proprietor.proprietor_id);
            console.log(manager.proprietor.proprietor_id);
            return res.status(403).json({ message: "Access Denied" });
        }

        const worker = await Worker.findOne({ worker_id: worker_id }).populate({ path: 'manager', model: 'Manager', select: 'manager_id proprietor', populate: { path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' } });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });

        if (proprietor_id !== worker.manager.proprietor.proprietor_id) {
            console.log(proprietor_id);
            console.log(worker.manager.proprietor.proprietor_id);
            return res.status(403).json({ message: "Access Denied" });
        }

        if (worker.manager.manager_id !== manager_id) {
            return res.status(404).json({ message: `Worker: ${worker_id} doesn't belong to manager: ${manager_id}` });
        }

        const item = await Item.findOne({ design_number: design_number, proprietor: proprietor._id });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });

        if (Number(quantity) <= 0) return res.status(400).json({ message: "Quantity should be positive" });

        if (Number(new_price) <= 0) return res.status(400).json({ message: "New price should be positive" });

        if (Number(new_underprocessing_value) <= 0) return res.status(400).json({ message: "New underprocessing value should be positive" });

        const current_date = new Date();

        const oHIndex = proprietor.on_hold.findIndex((oh) => (oh.item.equals(item._id) && Number(oh.quantity) >= Number(quantity) && Number(oh.price) === Number(price) && Number(oh.partial_payment) === Number(partial_payment) && oh.remarks_from_proprietor === remarks_from_proprietor && Number(oh.underprocessing_value) === Number(underprocessing_value) && Number(oh.deduction_from_manager) === Number(deduction_from_manager) && oh.remarks_from_manager === remarks_from_manager && isSameDay(oh.hold_date, hold_date) && oh.put_on_hold_by === put_on_hold_by && oh.holding_remarks === holding_remarks && oh.is_adhoc === is_adhoc && oh.manager.equals(manager._id) && oh.worker.equals(worker._id) && isSameHoldInfo(oh.hold_info, hold_info)));
        if (oHIndex === -1) {
            return res.status(404).json({ message: `${quantity} of ${design_number} not on hold at proprietor: ${proprietor_id}, with price: ${price}, partial payment: ${partial_payment}, underprocessing value: ${underprocessing_value}, remarks from proprietor: ${remarks_from_proprietor}, deduction from manager: ${deduction_from_manager}, remarks from manager: ${remarks_from_manager}, holding remarks: ${holding_remarks} and is_adhoc: ${is_adhoc}, put on hold by: ${put_on_hold_by}, manager: ${manager_id}, worker: ${worker_id}` });
        }

        const new_hold_info = {
            is_hold: true,
            price: Number(price),
            partial_payment: Number(partial_payment),
            underprocessing_value: Number(underprocessing_value),
            remarks_from_proprietor: remarks_from_proprietor,
            deduction_from_manager: Number(deduction_from_manager),
            remarks_from_manager: remarks_from_manager,
            is_adhoc: is_adhoc,
            hold_date: hold_date,
            holding_remarks: holding_remarks,
            put_on_hold_by: put_on_hold_by,
            manager: manager._id,
            worker: worker._id,
            prev_hold_info: proprietor.on_hold[oHIndex].hold_info
        }

        proprietor.on_hold[oHIndex].quantity -= Number(quantity);

        if (proprietor.on_hold[oHIndex].quantity === 0) {
            proprietor.on_hold.splice(oHIndex, 1);
        }

        newManager.issue_history.push({ item: item._id, quantity: quantity, price: Number(new_price), underprocessing_value: new_underprocessing_value, remarks_from_proprietor: new_remarks_from_proprietor, date: current_date, hold_info: new_hold_info });


        if (new_remarks_from_proprietor === "") {
            const td_index = newManager.total_due.findIndex((dueItem) => (dueItem.item.equals(item._id) && dueItem.remarks_from_proprietor === "" && dueItem.underprocessing_value === Number(new_underprocessing_value) && dueItem.price === Number(new_price) && isSameHoldInfo(dueItem.hold_info, new_hold_info)));
            if (td_index === -1) {
                newManager.total_due.push({ item: item._id, price: Number(new_price), quantity: quantity, underprocessing_value: new_underprocessing_value, remarks_from_proprietor: "", hold_info: new_hold_info });
            }
            else {
                newManager.total_due[td_index].quantity += Number(quantity);
            }

            const df_index = newManager.due_forward.findIndex((dueItem) => (dueItem.item.equals(item._id) && dueItem.remarks_from_proprietor === "" && dueItem.underprocessing_value === Number(new_underprocessing_value) && dueItem.price === Number(new_price) && isSameHoldInfo(dueItem.hold_info, new_hold_info)));

            if (df_index === -1) {
                newManager.due_forward.push({ item: item._id, price: Number(new_price), quantity: quantity, underprocessing_value: Number(new_underprocessing_value), remarks_from_proprietor: "", hold_info: new_hold_info });
            }
            else {
                newManager.due_forward[df_index].quantity += Number(quantity);
            }

        }
        else {
            newManager.total_due.push({ item: item._id, price: Number(new_price), quantity: quantity, underprocessing_value: Number(new_underprocessing_value), remarks_from_proprietor: new_remarks_from_proprietor, hold_info: new_hold_info });
            newManager.due_forward.push({ item: item._id, price: Number(new_price), quantity: quantity, underprocessing_value: Number(new_underprocessing_value), remarks_from_proprietor: new_remarks_from_proprietor, hold_info: new_hold_info });
        }

        await newManager.save();
        await proprietor.save();
        return res.status(200).json({ result: newManager });

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
    const { worker_id, design_number, submit_quantity, price, deduction_from_manager, remarks_from_manager, underprocessing_value, remarks_from_proprietor, is_adhoc, to_hold, hold_info } = req.body;

    if (!req.manager || req.manager.manager_id !== manager_id) return res.status(403).json({ message: "Access Denied" });

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

        const preparedHoldInfo = await depopulateHoldInfo(hold_info)
        const dbWorkerIndex = manager.due_backward.findIndex((w) => w.worker.equals(worker._id));
        if (dbWorkerIndex === -1) {
            return res.status(404).json({ message: `no goods due backward for worker: ${worker_id}` });
        }
        else {
            const dbItemIndex = manager.due_backward[dbWorkerIndex].items.findIndex((i) => (i.item.equals(item._id) && i.quantity >= Number(submit_quantity) && i.price === Number(price) && i.deduction_from_manager === Number(deduction_from_manager) && i.remarks_from_manager === remarks_from_manager && i.remarks_from_proprietor === remarks_from_proprietor && Number(i.underprocessing_value) === Number(underprocessing_value) && (i.is_adhoc === is_adhoc) && (i.to_hold === to_hold) && isSameHoldInfo(i.hold_info, preparedHoldInfo)));
            if (dbItemIndex === -1) {
                console.log("not found hold info", preparedHoldInfo)
                return res.status(404).json({ message: `${submit_quantity} of ${design_number}, to_hold: ${to_hold} and is_adhoc: ${is_adhoc} not due backward at manager: ${manager_id}, made by worker: ${worker_id} with price: ${price}, deduction from manager: ${deduction_from_manager} and remarks from manager: ${remarks_from_manager}, remarks from proprietor: ${remarks_from_proprietor} and underprocessing value: ${underprocessing_value}` });
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

        const current_date = new Date();

        // manager.due_amount += (1.1 * (Number(price) - Number(deduction)) * Number(quantity));

        let sWorkerIndex = manager.submissions.findIndex((s) => s.worker.equals(worker._id));
        if (sWorkerIndex === -1) {
            manager.submissions.push({ worker: worker._id, items: [] });
            sWorkerIndex = manager.submissions.length - 1;
        }

        // if (Number(deduction_from_manager) !== 0 || remarks_from_manager !== "" || remarks_from_proprietor !== "" || to_hold) {
        //     manager.submissions[sWorkerIndex].items.push({ item: item._id, quantity: Number(submit_quantity), price: Number(price), deduction_from_manager: Number(deduction_from_manager), remarks_from_manager: remarks_from_manager, remarks_from_proprietor: remarks_from_proprietor, underprocessing_value: underprocessing_value, date: current_date, is_adhoc: is_adhoc, to_hold: to_hold });
        // }
        // else {
        let sItemIndex = manager.submissions[sWorkerIndex].items.findIndex((i) => (i.item.equals(item._id) && i.price === Number(price) && i.deduction_from_manager === Number(deduction_from_manager) && i.remarks_from_manager === remarks_from_manager && i.remarks_from_proprietor === remarks_from_proprietor && Number(i.underprocessing_value) === Number(underprocessing_value) && is_adhoc === i.is_adhoc && to_hold === i.to_hold && isSameHoldInfo(i.hold_info, preparedHoldInfo)));
        if (sItemIndex === -1) {
            manager.submissions[sWorkerIndex].items.push({ item: item._id, quantity: Number(submit_quantity), price: Number(price), deduction_from_manager: Number(deduction_from_manager), remarks_from_manager: remarks_from_manager, remarks_from_proprietor: remarks_from_proprietor, underprocessing_value: underprocessing_value, date: current_date, is_adhoc: is_adhoc, to_hold: to_hold, hold_info: preparedHoldInfo });
        }
        else {
            manager.submissions[sWorkerIndex].items[sItemIndex].quantity += Number(submit_quantity);
        }
        // }

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

    if (!req.manager || req.manager.manager_id !== manager_id) return res.status(403).json({ message: "Access Denied" });

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

    if (!req.manager || req.manager.manager_id !== manager_id) return res.status(403).json({ message: "Access Denied" });

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
        ]).lean();

        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        if (!req.proprietor || req.proprietor.proprietor_id !== manager.proprietor.proprietor_id) return res.status(403).json({ message: "Access Denied" });
        const peparedManager = await prepare(managerPopulatePaths, manager, true)
        res.status(200).json(peparedManager.submissions);
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }
}

//add hold info
export const acceptFromManager = async (req, res) => {
    console.log(req.body);
    const manager_id = req.params.manager_id;
    console.log(`accept from manager manager_id: ${manager_id}`);
    if (!req.proprietor || !req.proprietor.proprietor_id) return res.status(403).json({ message: "Access Denied" });
    const proprietor_id = req.proprietor.proprietor_id;
    const { action, worker_id, design_number, price, partial_payment, deduction_from_manager, remarks_from_manager, underprocessing_value, remarks_from_proprietor, quantity, deduction, final_remarks, is_adhoc, to_hold, hold_info } = req.body;

    try {
        if (!(["hold", "forfeit", "accept"].includes(action))) {
            return res.status(400).json({ message: "Action should be either hold, forfeit or accept" });
        }

        const proprietor = await Proprietor.findOne({ proprietor_id }, { id: 0, password: 0 });
        if (!proprietor) return res.status(404).json({ message: "Proprietor doesn't exist" });

        const manager = await Manager.findOne({ manager_id: manager_id }, { id: 0, password: 0 }).populate([
            { path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' }
        ]);
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });

        if (proprietor_id !== manager.proprietor.proprietor_id) return res.status(403).json({ message: "Access Denied" });

        const worker = await Worker.findOne({ worker_id: worker_id, manager: manager._id });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });

        const item = await Item.findOne({ design_number: design_number, proprietor: manager.proprietor });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });
        // const [day, month, year] = date.split('/').map(Number);
        // const dateObj = new Date(year, month - 1, day);

        const preparedHoldInfo = await depopulateHoldInfo(hold_info)

        const tdIndex = manager.total_due.findIndex((td) => (td.item.equals(item._id) && td.quantity >= Number(quantity) && td.remarks_from_proprietor === remarks_from_proprietor && Number(td.underprocessing_value) === Number(underprocessing_value) && td.is_adhoc === is_adhoc && isSameHoldInfo(td.hold_info, preparedHoldInfo)));
        if (tdIndex === -1) {
            return res.status(404).json({ message: `${quantity} of ${design_number} and is_adhoc: ${is_adhoc} with underprocessing value: ${underprocessing_value} and remarks from proprietor: ${remarks_from_proprietor} not due at manager: ${manager_id}` });
        }

        const sWorkerIndex = manager.submissions.findIndex((w) => w.worker.equals(worker._id));
        if (sWorkerIndex === -1) {
            return res.status(404).json({ message: `no goods made by worker: ${worker_id} are in submissions` });
        }

        const sItemIndex = manager.submissions[sWorkerIndex].items.findIndex((i) => (i.item.equals(item._id) && i.quantity >= Number(quantity) && i.price === Number(price) && i.deduction_from_manager === Number(deduction_from_manager) && i.remarks_from_manager === remarks_from_manager && i.remarks_from_proprietor === remarks_from_proprietor && Number(i.underprocessing_value) === Number(underprocessing_value) && i.is_adhoc === is_adhoc && isSameHoldInfo(i.hold_info, preparedHoldInfo)));
        if (sItemIndex === -1) {
            return res.status(404).json({ message: `${quantity} of ${design_number} and is_adhoc: ${is_adhoc} not submiited by manager: ${manager_id}, made by worker: ${worker_id} with price: ${price}, deduction from manager: ${deduction_from_manager}, remarks from manager: ${remarks_from_manager}, remarks from proprietor: ${remarks_from_proprietor} and underprocessing value: ${underprocessing_value}` });
        }

        if (Number(quantity) <= 0) {
            return res.status(400).json({ message: "Accept/Forfeit/Hold quantity should be positive" });
        }

        let hmIndex = -1;

        if (to_hold) {
            hmIndex = worker.held_by_manager.findIndex((h) => (h.item.equals(item._id) && h.quantity >= Number(quantity) && h.price === Number(price) && h.remarks_from_manager === remarks_from_manager && h.remarks_from_proprietor === remarks_from_proprietor && Number(h.underprocessing_value) === Number(underprocessing_value) && h.is_adhoc === is_adhoc && isSameHoldInfo(h.hold_info, preparedHoldInfo)));
            if (hmIndex === -1) {
                return res.status(404).json({ message: `${quantity} of ${design_number} and is_adhoc: ${is_adhoc} not held by manager: ${manager_id}, made by worker: ${worker_id} with price: ${price}, remarks from manager: ${remarks_from_manager}, remarks from proprietor: ${remarks_from_proprietor} and underprocessing value: ${underprocessing_value}` });
            }
        }

        const current_date = new Date();

        if (action === "accept") {

            if (Number(deduction) > (Number(manager.submissions[sWorkerIndex].items[sItemIndex].price) - Number(manager.submissions[sWorkerIndex].items[sItemIndex].deduction_from_manager))) {
                return res.status(400).json({ message: "Deduction can't be more than the price (remaining after deduction_from_manager)" });
            }

            if (Number(deduction) !== 0 && final_remarks === "") {
                return res.status(400).json({ message: "Final remarks are required if deduction is made by proprietor" });
            }

            let ahIndex = manager.accepted_history.findIndex((w) => (w.worker.equals(worker._id) && isSameDay(w.date, current_date)));
            if (ahIndex === -1) {
                manager.accepted_history.push({ worker: worker._id, date: current_date, items: [] });
                ahIndex = manager.accepted_history.length - 1;
            }

            // if (Number(deduction) !== 0 || final_remarks !== "") {
            //     manager.accepted_history[ahIndex].items.push({ item: item._id, quantity: Number(quantity), price: Number(price), deduction_from_manager: Number(deduction_from_manager), remarks_from_manager: remarks_from_manager, underprocessing_value: Number(underprocessing_value), remarks_from_proprietor: remarks_from_proprietor, deduction_from_proprietor: Number(deduction), final_remarks_from_proprietor: final_remarks, is_adhoc: is_adhoc });
            // }
            // else {

            const ahItemIndex = manager.accepted_history[ahIndex].items.findIndex((i) => (i.item.equals(item._id) && i.price === Number(price) && i.deduction_from_manager === Number(deduction_from_manager) && i.remarks_from_manager === remarks_from_manager && i.remarks_from_proprietor === remarks_from_proprietor && Number(i.underprocessing_value) === Number(underprocessing_value) && i.deduction_from_proprietor === Number(deduction) && i.final_remarks_from_proprietor === final_remarks && i.is_adhoc === is_adhoc && isSameHoldInfo(i.hold_info, preparedHoldInfo)));
            if (ahItemIndex === -1) {
                manager.accepted_history[ahIndex].items.push({ item: item._id, quantity: Number(quantity), price: Number(price), deduction_from_manager: Number(deduction_from_manager), remarks_from_manager: remarks_from_manager, underprocessing_value: Number(underprocessing_value), remarks_from_proprietor: remarks_from_proprietor, deduction_from_proprietor: Number(deduction), final_remarks_from_proprietor: final_remarks, is_adhoc: is_adhoc, hold_info: preparedHoldInfo });
            }
            else {
                manager.accepted_history[ahIndex].items[ahItemIndex].quantity += Number(quantity);
            }
            // }

            if (Number(deduction) !== 0) {
                worker.deductions_from_proprietor.push({ item: item._id, price: price, quantity: quantity, deduction_from_proprietor: deduction, final_remarks_from_proprietor: final_remarks, deduction_from_manager: deduction_from_manager, deduction_date: current_date, remarks_from_manager: remarks_from_manager, remarks_from_proprietor: remarks_from_proprietor, is_adhoc: is_adhoc, hold_info: preparedHoldInfo });
            }

            if (to_hold) {
                worker.due_amount += (Number(quantity) * (Number(price) - Number(deduction)));
                manager.due_amount += (1.1 * (Number(price) - Number(deduction)) * Number(quantity));
            }
            else {
                worker.due_amount -= (Number(quantity) * Number(deduction));
                manager.due_amount += (1.1 * (Number(price) - Number(deduction) - Number(deduction_from_manager)) * Number(quantity));
            }
        }
        else if (action === "forfeit") {
            if (final_remarks === "") {
                return res.status(400).json({ message: "Final remarks are required if forfeiture is made by proprietor" });
            }

            let fhIndex = manager.forfeited_history.findIndex((f) => (f.worker.equals(worker._id) && isSameDay(f.forfeiture_date, current_date)));
            if (fhIndex === -1) {
                manager.forfeited_history.push({ worker: worker._id, forfeiture_date: current_date, items: [] });
                fhIndex = manager.forfeited_history.length - 1;
            }

            manager.forfeited_history[fhIndex].items.push({ item: item._id, quantity: Number(quantity), price: Number(price), deduction_from_manager: Number(deduction_from_manager), remarks_from_manager: remarks_from_manager, underprocessing_value: Number(underprocessing_value), remarks_from_proprietor: remarks_from_proprietor, final_remarks_from_proprietor: final_remarks, is_adhoc: is_adhoc, hold_info: preparedHoldInfo });

            worker.forfeited_history.push({ item: item._id, price: price, quantity: quantity, underprocessing_value: underprocessing_value, deduction_from_manager: deduction_from_manager, remarks_from_manager: remarks_from_manager, remarks_from_proprietor: remarks_from_proprietor, forfeiture_date: current_date, final_remarks_from_proprietor: final_remarks, is_adhoc: is_adhoc, hold_info: preparedHoldInfo });

            if (to_hold) {
                worker.due_amount -= (Number(quantity) * Number(underprocessing_value));
            }
            else {
                worker.due_amount -= (Number(quantity) * (Number(underprocessing_value) + (Number(price) - Number(deduction_from_manager))));
            }

            manager.due_amount -= (Number(underprocessing_value) * Number(quantity));

        }
        else if (action === "hold") {

            if (Number(partial_payment) < 0 || Number(partial_payment) > (Number(price) - Number(deduction_from_manager))) {
                return res.status(400).json({ message: "Partial payment should be non-negative and less than or equal to price minus deduction from manager" });
            }

            if (final_remarks === "") {
                return res.status(400).json({ message: "Holding remarks should not be empty" });
            }

            let put_on_hold_by = "";
            if (to_hold) {
                put_on_hold_by = "manager";
                worker.due_amount += (Number(partial_payment) * Number(quantity));
            }
            else {
                put_on_hold_by = "proprietor";
                worker.due_amount -= (((Number(price) - Number(deduction_from_manager)) - Number(partial_payment)) * Number(quantity));
            }

            worker.on_hold_history.push({ item: item._id, quantity: Number(quantity), price: Number(price), partial_payment: Number(partial_payment), underprocessing_value: Number(underprocessing_value), remarks_from_proprietor: remarks_from_proprietor, deduction_from_manager: Number(deduction_from_manager), remarks_from_manager: remarks_from_manager, hold_date: current_date, put_on_hold_by: put_on_hold_by, holding_remarks: final_remarks, is_adhoc: is_adhoc, hold_info: preparedHoldInfo });

            manager.due_amount += (1.1 * Number(partial_payment) * Number(quantity));

            let manHoldIndex = manager.on_hold_history.findIndex((h) => h.worker.equals(worker._id) && isSameDay(h.hold_date, current_date));

            if (manHoldIndex === -1) {
                manager.on_hold_history.push({ worker: worker._id, hold_date: current_date, items: [] });
                manHoldIndex = manager.on_hold_history.length - 1;
            }

            manager.on_hold_history[manHoldIndex].items.push({ item: item._id, quantity: Number(quantity), price: Number(price), partial_payment: Number(partial_payment), underprocessing_value: Number(underprocessing_value), remarks_from_proprietor: remarks_from_proprietor, deduction_from_manager: Number(deduction_from_manager), remarks_from_manager: remarks_from_manager, holding_remarks: final_remarks, put_on_hold_by: put_on_hold_by, is_adhoc: is_adhoc, hold_info: preparedHoldInfo });

            proprietor.on_hold.push({ item: item._id, quantity: Number(quantity), price: Number(price), partial_payment: Number(partial_payment), underprocessing_value: Number(underprocessing_value), remarks_from_proprietor: remarks_from_proprietor, deduction_from_manager: Number(deduction_from_manager), remarks_from_manager: remarks_from_manager, holding_remarks: final_remarks, put_on_hold_by: put_on_hold_by, is_adhoc: is_adhoc, worker: worker._id, manager: manager._id, hold_info: preparedHoldInfo, hold_date: current_date });

        }

        if (to_hold) {
            worker.held_by_manager[hmIndex].quantity -= Number(quantity);
            if (worker.held_by_manager[hmIndex].quantity === 0) {
                worker.held_by_manager.splice(hmIndex, 1);
            }
        }

        manager.submissions[sWorkerIndex].items[sItemIndex].quantity -= Number(quantity);
        if (manager.submissions[sWorkerIndex].items[sItemIndex].quantity === 0) {
            manager.submissions[sWorkerIndex].items.splice(sItemIndex, 1);
        }

        if (manager.submissions[sWorkerIndex].items.length === 0) {
            manager.submissions.splice(sWorkerIndex, 1);
        }

        manager.total_due[tdIndex].quantity -= Number(quantity);
        if (manager.total_due[tdIndex].quantity === 0) {
            manager.total_due.splice(tdIndex, 1);
        }

        await manager.save();
        await worker.save();
        await proprietor.save();
        return res.status(200).json({ result: manager });

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }
}


