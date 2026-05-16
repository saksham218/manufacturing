import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Manager from "../models/manager.js";
import Worker from "../models/worker.js";
import Proprietor from "../models/proprietor.js";
import Item from "../models/item.js";
import { addToTransient, validateAndRemoveFromTransient, depopulateHoldInfo, getRemovalQuantitiesFromTransient, isDayGreaterThanOrEqualTo, isDayLessThanOrEqualTo, isSameDay, isSameHoldInfo, managerPopulatePaths, prepare } from "../utils/utils.js";

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
                { path: 'accepted_history.item', model: 'Item', select: 'design_number description' },
                { path: 'due_forward.item', model: 'Item', select: 'design_number description' },
                { path: 'due_forward_log.item', model: 'Item', select: 'design_number description' },
                { path: 'due_backward.worker', model: 'Worker', select: 'name worker_id' },
                { path: 'due_backward.item', model: 'Item', select: 'design_number description' },
                { path: 'due_backward_log.worker', model: 'Worker', select: 'name worker_id' },
                { path: 'due_backward_log.item', model: 'Item', select: 'design_number description' },
                { path: 'submissions.worker', model: 'Worker', select: 'name worker_id' },
                { path: 'submissions.item', model: 'Item', select: 'design_number description' },
                { path: 'total_due.item', model: 'Item', select: 'design_number description' },
                { path: 'total_due_log.item', model: 'Item', select: 'design_number description' },
                { path: 'forfeited_history.worker', model: 'Worker', select: 'name worker_id' },
                { path: 'forfeited_history.item', model: 'Item', select: 'design_number description' },
                { path: 'on_hold_history.worker', model: 'Worker', select: 'name worker_id' },
                { path: 'on_hold_history.item', model: 'Item', select: 'design_number description' },
                { path: 'submit_history.worker', model: 'Worker', select: 'name worker_id' },
                { path: 'submit_history.item', model: 'Item', select: 'design_number description' },
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
    const { design_number, quantity, underprocessing_value, general_price, remarks, issue_date } = req.body;
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
        const issueDateObj = new Date(issue_date);
        manager.issue_history.push({ item: item._id, quantity: quantity, underprocessing_value: underprocessing_value, general_price: general_price, remarks_from_proprietor: remarks, issue_date: issueDateObj, record_date: dateObj });

        // const df_index = manager.due_forward.findIndex((dueItem) => dueItem.item.equals(item._id) && dueunderprocessing_value === Number(underprocessing_value) && dueItem.remarks_from_proprietor === remarks);
        // if (df_index === -1) {
        //     manager.due_forward.push({ item: item._id, quantity: quantity, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks });
        // }
        // else {
        //     manager.due_forward[df_index].quantity += Number(quantity);
        // }

        // manager.due_forward.push({ item: item._id, quantity: quantity, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks });

        // const td_index = manager.total_due.findIndex((dueItem) => (dueItem.item.equals(item._id) && dueItem.remarks_from_proprietor === remarks && dueItem.underprocessing_value === Number(underprocessing_value) && dueItem.is_adhoc === false && isSameHoldInfo(dueItem.hold_info, null) && dueItem.price === null));
        // if (td_index === -1) {
        //     manager.total_due.push({ item: item._id, quantity: quantity, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks, is_adhoc: false, hold_info: null, price: null, event_date: issue_date, record_date: dateObj });
        // }
        // else {
        //     manager.total_due[td_index].quantity += Number(quantity);
        //     manager.total_due[td_index].record_date = dateObj;
        //     if (isDayGreaterThanOrEqualTo(issueDateObj, manager.total_due[td_index].event_date)) {
        //         manager.total_due[td_index].event_date = issueDateObj;
        //     }
        // }

        // const df_index = manager.due_forward.findIndex((dueItem) => (dueItem.item.equals(item._id) && dueItem.remarks_from_proprietor === remarks && dueItem.underprocessing_value === Number(underprocessing_value) && isSameHoldInfo(dueItem.hold_info, null) && dueItem.price === null));

        // if (df_index === -1) {
        //     manager.due_forward.push({ item: item._id, quantity: quantity, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks, hold_info: null, price: null, event_date: issueDateObj, record_date: dateObj });
        // }
        // else {
        //     manager.due_forward[df_index].quantity += Number(quantity);
        //     manager.due_forward[df_index].record_date = dateObj;
        //     if (isDayGreaterThanOrEqualTo(issueDateObj, manager.due_forward[df_index].event_date)) {
        //         manager.due_forward[df_index].event_date = issueDateObj;
        //     }
        // }

        // let df_log_index = -1;
        // let shouldInsert = true;
        // let i = 0;
        // let prevQuantity = 0;

        // for (i = 0; i < manager.due_forward_log.length; i++) {
        //     const log = manager.due_forward_log[i];

        //     if (log.item.equals(item._id) && log.remarks_from_proprietor === remarks && log.underprocessing_value === Number(underprocessing_value) && isSameHoldInfo(log.hold_info, null) && log.price === null && !isDayGreaterThanOrEqualTo(log.event_date, issueDateObj)) {
        //         prevQuantity = log.quantity;
        //     }

        //     if (log.item.equals(item._id) && log.remarks_from_proprietor === remarks && log.underprocessing_value === Number(underprocessing_value) && isSameHoldInfo(log.hold_info, null) && log.price === null && isSameDay(log.event_date, issueDateObj)) {
        //         log.quantity += Number(quantity);
        //         log.record_date = dateObj;
        //         shouldInsert = false;
        //         break;
        //     }
        //     if (!isDayLessThanOrEqualTo(log.event_date, issueDateObj)) {
        //         break;
        //     }
        // }

        // df_log_index = i;

        // if (shouldInsert) {
        //     manager.due_forward_log.splice(df_log_index, 0, { item: item._id, quantity: prevQuantity + Number(quantity), underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks, hold_info: null, price: null, event_date: issueDateObj, record_date: dateObj });
        // }

        // for (let i = df_log_index + 1; i < manager.due_forward_log.length; i++) {
        //     const log = manager.due_forward_log[i];
        //     if (log.item.equals(item._id) && log.remarks_from_proprietor === remarks && log.underprocessing_value === Number(underprocessing_value) && isSameHoldInfo(log.hold_info, null) && log.price === null) {
        //         log.quantity += Number(quantity);
        //         log.record_date = dateObj;
        //     }
        // }

        addToTransient(
            manager.total_due,
            manager.total_due_log,
            (dueItem) => (dueItem.item.equals(item._id) && dueItem.remarks_from_proprietor === remarks && dueItem.underprocessing_value === Number(underprocessing_value) && dueItem.is_adhoc === false && isSameHoldInfo(dueItem.hold_info, null) && dueItem.price === null),
            { item: item._id, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks, is_adhoc: false, hold_info: null, price: null },
            quantity,
            issueDateObj,
            dateObj
        );

        addToTransient(
            manager.due_forward,
            manager.due_forward_log,
            (dueItem) => (dueItem.item.equals(item._id) && dueItem.remarks_from_proprietor === remarks && dueItem.underprocessing_value === Number(underprocessing_value) && isSameHoldInfo(dueItem.hold_info, null) && dueItem.price === null),
            { item: item._id, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks, hold_info: null, price: null },
            quantity,
            issueDateObj,
            dateObj
        )

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
    const { design_number, quantity, new_price, new_underprocessing_value, new_remarks_from_proprietor, price, partial_payment, underprocessing_value, remarks_from_proprietor, deduction_from_manager, remarks_from_manager, hold_date, put_on_hold_by, holding_remarks, is_adhoc, worker_id, manager_id, submit_to_proprietor_date, hold_info, issue_date } = req.body;
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

        const preparedHoldInfo = await depopulateHoldInfo(hold_info);

        const holdDateObj = new Date(hold_date);
        const submitToProprietorDateObj = new Date(submit_to_proprietor_date);
        const issueDateObj = new Date(issue_date);
        const dateObj = new Date();

        const removalSuccess = validateAndRemoveFromTransient(
            proprietor.on_hold,
            proprietor.on_hold_log,
            undefined, undefined, undefined, undefined,
            (oh) => oh.item.equals(item._id) && Number(oh.price) === Number(price) && Number(oh.partial_payment) === Number(partial_payment) && oh.remarks_from_proprietor === remarks_from_proprietor && Number(oh.underprocessing_value) === Number(underprocessing_value) && Number(oh.deduction_from_manager) === Number(deduction_from_manager) && oh.remarks_from_manager === remarks_from_manager && isSameDay(oh.hold_date, holdDateObj) && isSameDay(oh.submit_to_proprietor_date, submitToProprietorDateObj) && oh.put_on_hold_by === put_on_hold_by && oh.holding_remarks === holding_remarks && oh.is_adhoc === is_adhoc && oh.manager.equals(manager._id) && oh.worker.equals(worker._id) && isSameHoldInfo(oh.hold_info, preparedHoldInfo),
            { item: item._id, price: Number(price), partial_payment: Number(partial_payment), underprocessing_value: Number(underprocessing_value), remarks_from_proprietor, deduction_from_manager: Number(deduction_from_manager), remarks_from_manager, put_on_hold_by, holding_remarks, is_adhoc, manager: manager._id, worker: worker._id, hold_date: holdDateObj, submit_to_proprietor_date: submitToProprietorDateObj, hold_info: preparedHoldInfo },
            Number(quantity),
            issueDateObj,
            dateObj
        );

        if (!removalSuccess) {
            return res.status(400).json({ message: `${quantity} of ${design_number} submitted to proprietor on ${submit_to_proprietor_date}, not on hold at proprietor: ${proprietor_id}, with price: ${price}, partial payment: ${partial_payment}, underprocessing value: ${underprocessing_value}, remarks from proprietor: ${remarks_from_proprietor}, deduction from manager: ${deduction_from_manager}, remarks from manager: ${remarks_from_manager}, holding remarks: ${holding_remarks} and is_adhoc: ${is_adhoc}, put on hold by: ${put_on_hold_by}, manager: ${manager_id}, worker: ${worker_id}` });
        }

        const new_hold_info = {
            is_hold: true,
            price: Number(price),
            partial_payment: Number(partial_payment),
            underprocessing_value: Number(underprocessing_value),
            remarks_from_proprietor,
            deduction_from_manager: Number(deduction_from_manager),
            remarks_from_manager,
            is_adhoc,
            hold_date: holdDateObj,
            holding_remarks,
            put_on_hold_by,
            manager: manager._id,
            worker: worker._id,
            submit_to_proprietor_date: submitToProprietorDateObj,
            prev_hold_info: preparedHoldInfo
        };

        newManager.issue_history.push({ item: item._id, quantity, price: Number(new_price), underprocessing_value: new_underprocessing_value, remarks_from_proprietor: new_remarks_from_proprietor, hold_info: new_hold_info, issue_date: issueDateObj, record_date: dateObj });

        addToTransient(
            newManager.total_due,
            newManager.total_due_log,
            (dueItem) => dueItem.item.equals(item._id) && dueItem.remarks_from_proprietor === new_remarks_from_proprietor && dueItem.underprocessing_value === Number(new_underprocessing_value) && dueItem.price === Number(new_price) && dueItem.is_adhoc === false && isSameHoldInfo(dueItem.hold_info, new_hold_info),
            { item: item._id, price: Number(new_price), underprocessing_value: Number(new_underprocessing_value), remarks_from_proprietor: new_remarks_from_proprietor, is_adhoc: false, hold_info: new_hold_info },
            quantity,
            issueDateObj,
            dateObj
        );

        addToTransient(
            newManager.due_forward,
            newManager.due_forward_log,
            (dueItem) => dueItem.item.equals(item._id) && dueItem.remarks_from_proprietor === new_remarks_from_proprietor && dueItem.underprocessing_value === Number(new_underprocessing_value) && dueItem.price === Number(new_price) && isSameHoldInfo(dueItem.hold_info, new_hold_info),
            { item: item._id, price: Number(new_price), underprocessing_value: Number(new_underprocessing_value), remarks_from_proprietor: new_remarks_from_proprietor, hold_info: new_hold_info },
            quantity,
            issueDateObj,
            dateObj
        );

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
    const manager_id = req.params.manager_id;
    const { worker_id, design_number, quantity, price, deduction_from_manager, submit_date, remarks_from_manager, underprocessing_value, remarks_from_proprietor, is_adhoc, to_hold, hold_info } = req.body;

    if (!req.manager || req.manager.manager_id !== manager_id) return res.status(403).json({ message: "Access Denied" });

    try {
        const manager = await Manager.findOne({ manager_id: manager_id });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });

        const worker = await Worker.findOne({ worker_id: worker_id, manager: manager._id });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });

        const item = await Item.findOne({ design_number: design_number, proprietor: manager.proprietor });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });

        const dateObj = new Date();
        const submitDateObj = new Date(submit_date);

        const preparedHoldInfo = await depopulateHoldInfo(hold_info);

        const removalSuccess = validateAndRemoveFromTransient(
            manager.due_backward,
            manager.due_backward_log,
            undefined, undefined, undefined, undefined,
            (db) => db.worker.equals(worker._id) && db.item.equals(item._id) && db.price === Number(price) && db.deduction_from_manager === Number(deduction_from_manager) && db.remarks_from_manager === remarks_from_manager && Number(db.underprocessing_value) === Number(underprocessing_value) && db.remarks_from_proprietor === remarks_from_proprietor && db.is_adhoc === is_adhoc && db.to_hold === to_hold && isSameHoldInfo(db.hold_info, preparedHoldInfo),
            {
                worker: worker._id,
                item: item._id,
                price: Number(price),
                deduction_from_manager: Number(deduction_from_manager),
                remarks_from_manager,
                underprocessing_value: Number(underprocessing_value),
                remarks_from_proprietor,
                is_adhoc,
                to_hold,
                hold_info: preparedHoldInfo
            },
            Number(quantity),
            submitDateObj,
            dateObj
        );

        if (!removalSuccess) {
            return res.status(404).json({ message: `${quantity} of ${design_number} with is_adhoc: ${is_adhoc}, to_hold: ${to_hold}, price: ${price}, deduction_from_manager: ${deduction_from_manager}, remarks_from_manager: ${remarks_from_manager}, remarks_from_proprietor: ${remarks_from_proprietor}, underprocessing_value: ${underprocessing_value} not due backward at manager: ${manager_id} for worker: ${worker_id}` });
        }

        addToTransient(
            manager.submissions,
            null,
            (db) => db.worker.equals(worker._id) && db.item.equals(item._id) && isSameDay(submitDateObj, db.submit_to_proprietor_date) && db.price === Number(price) && db.deduction_from_manager === Number(deduction_from_manager) && db.remarks_from_manager === remarks_from_manager && Number(db.underprocessing_value) === Number(underprocessing_value) && db.remarks_from_proprietor === remarks_from_proprietor && db.is_adhoc === is_adhoc && db.to_hold === to_hold && isSameHoldInfo(db.hold_info, preparedHoldInfo),
            {
                worker: worker._id,
                item: item._id,
                submit_to_proprietor_date: submitDateObj,
                price: Number(price),
                deduction_from_manager: Number(deduction_from_manager),
                remarks_from_manager,
                underprocessing_value: Number(underprocessing_value),
                remarks_from_proprietor,
                is_adhoc,
                to_hold,
                hold_info: preparedHoldInfo
            },
            Number(quantity),
            submitDateObj,
            dateObj
        );

        manager.submit_history.push({
            submit_date: submitDateObj,
            item: item._id,
            quantity: Number(quantity),
            price: Number(price),
            underprocessing_value: Number(underprocessing_value),
            remarks_from_proprietor,
            deduction_from_manager: Number(deduction_from_manager),
            remarks_from_manager,
            is_adhoc,
            to_hold,
            hold_info: preparedHoldInfo,
            worker: worker._id,
            record_date: dateObj
        });

        await manager.save();
        return res.status(200).json({ result: manager });

    }
    catch (error) {
        console.log(error);
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
    const { accept_date } = req.body;

    try {
        const manager = await Manager.findOne({ manager_id: manager_id })
            .select('submissions proprietor submit_history accepted_history on_hold_history forfeited_history')
            .populate([
                { path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' },
                { path: 'submissions.worker', model: 'Worker', select: 'name worker_id' },
                { path: 'submissions.item', model: 'Item', select: 'design_number description' },
                { path: 'submit_history.worker', model: 'Worker', select: 'name worker_id' },
                { path: 'submit_history.item', model: 'Item', select: 'design_number description' },
                { path: 'accepted_history.worker', model: 'Worker', select: 'name worker_id' },
                { path: 'accepted_history.item', model: 'Item', select: 'design_number description' },
                { path: 'on_hold_history.worker', model: 'Worker', select: 'name worker_id' },
                { path: 'on_hold_history.item', model: 'Item', select: 'design_number description' },
                { path: 'forfeited_history.worker', model: 'Worker', select: 'name worker_id' },
                { path: 'forfeited_history.item', model: 'Item', select: 'design_number description' },
            ]).lean();

        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        if (!req.proprietor || req.proprietor.proprietor_id !== manager.proprietor.proprietor_id) return res.status(403).json({ message: "Access Denied" });

        const peparedManager = await prepare(managerPopulatePaths, manager, true);

        const additionHistory = peparedManager.submit_history.map(sh => ({ ...sh, submit_to_proprietor_date: sh.submit_date }));

        const removalHistory = [
            ...peparedManager.accepted_history.map(ah => ({ ...ah._doc, to_hold: ah.was_to_hold, action_date: ah.accept_date })),
            ...peparedManager.on_hold_history.map(oh => ({ ...oh._doc, to_hold: oh.was_to_hold, action_date: oh.hold_date })),
            ...peparedManager.forfeited_history.map(fh => ({ ...fh._doc, to_hold: fh.was_to_hold, action_date: fh.forfeiture_date })),
        ];

        const submissions = getRemovalQuantitiesFromTransient(
            peparedManager.submissions,
            undefined,
            additionHistory,
            'submit_date',
            removalHistory,
            'action_date',
            ['worker', 'item', 'submit_to_proprietor_date', 'price', 'deduction_from_manager', 'remarks_from_manager', 'underprocessing_value', 'remarks_from_proprietor', 'is_adhoc', 'to_hold', 'hold_info'],
            accept_date
        );

        return res.status(200).json(submissions);
    }
    catch (error) {
        console.log(error);
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
    const { action, worker_id, design_number, price, partial_payment, deduction_from_manager, remarks_from_manager, underprocessing_value, remarks_from_proprietor, quantity, deduction, penalty, final_remarks, is_adhoc, to_hold, action_date, submit_to_proprietor_date, hold_info } = req.body;

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

        const item = await Item.findOne({ design_number: design_number, proprietor: manager.proprietor._id });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });
        // const [day, month, year] = date.split('/').map(Number);
        // const dateObj = new Date(year, month - 1, day);

        if (Number(quantity) <= 0) {
            return res.status(400).json({ message: "Accept/Forfeit/Hold quantity should be positive" });
        }

        const actionDateObj = new Date(action_date);
        const submitToProprietorDateObj = new Date(submit_to_proprietor_date);
        const dateObj = new Date();

        const preparedHoldInfo = await depopulateHoldInfo(hold_info)

        const totalDueRemoved = validateAndRemoveFromTransient(
            manager.total_due,
            manager.total_due_log,
            undefined, undefined, undefined, undefined,
            (td) => td.item.equals(item._id) && td.is_adhoc === is_adhoc && (!is_adhoc ? td.price === null : td.price === Number(price)) && td.remarks_from_proprietor === remarks_from_proprietor && Number(td.underprocessing_value) === Number(underprocessing_value) && isSameHoldInfo(td.hold_info, preparedHoldInfo),
            { item: item._id, price: !is_adhoc ? null : Number(price), remarks_from_proprietor, underprocessing_value: Number(underprocessing_value), is_adhoc, hold_info: preparedHoldInfo },
            Number(quantity),
            actionDateObj,
            dateObj
        );

        if (!totalDueRemoved) {
            return res.status(404).json({ message: `${quantity} of ${design_number} and is_adhoc: ${is_adhoc} with underprocessing value: ${underprocessing_value} and remarks from proprietor: ${remarks_from_proprietor} not due at manager: ${manager_id}` });
        }

        // const sIndex = manager.submissions.findIndex((s) => s.worker.equals(worker._id) && s.item.equals(item._id) && s.quantity >= Number(quantity) && isSameDay(s.submit_to_proprietor_date, submit_to_proprietor_date_obj) && s.price === Number(price) && s.deduction_from_manager === Number(deduction_from_manager) && s.remarks_from_manager === remarks_from_manager && s.remarks_from_proprietor === remarks_from_proprietor && Number(s.underprocessing_value) === Number(underprocessing_value) && s.is_adhoc === is_adhoc && isSameHoldInfo(s.hold_info, preparedHoldInfo));
        // if (sIndex === -1) {
        //     return res.status(404).json({ message: `${quantity} of ${design_number} and is_adhoc: ${is_adhoc} not submitted to proprietor by manager: ${manager_id} on ${submit_to_proprietor_date}, made by worker: ${worker_id} with price: ${price}, deduction from manager: ${deduction_from_manager}, remarks from manager: ${remarks_from_manager}, remarks from proprietor: ${remarks_from_proprietor} and underprocessing value: ${underprocessing_value}` });
        // }

        const proprietorActionManagerHistory = [
            ...manager.accepted_history.map(ah => ({ ...ah._doc, to_hold: ah.was_to_hold, action_date: ah.accept_date })),
            ...manager.on_hold_history.map(oh => ({ ...oh._doc, to_hold: oh.was_to_hold, action_date: oh.hold_date })),
            ...manager.forfeited_history.map(fh => ({ ...fh._doc, to_hold: fh.was_to_hold, action_date: fh.forfeiture_date })),
        ];

        console.log(proprietorActionManagerHistory);

        const submissionRemoved = validateAndRemoveFromTransient(
            manager.submissions,
            undefined,
            manager.submit_history,
            'submit_date',
            proprietorActionManagerHistory,
            'action_date',
            (s) => s.worker.equals(worker._id) && s.item?.equals(item._id) && isSameDay(s.submit_to_proprietor_date, submitToProprietorDateObj) && s.price === Number(price) && s.deduction_from_manager === Number(deduction_from_manager) && s.remarks_from_manager === remarks_from_manager && s.remarks_from_proprietor === remarks_from_proprietor && Number(s.underprocessing_value) === Number(underprocessing_value) && s.is_adhoc === is_adhoc && s.to_hold === to_hold && isSameHoldInfo(s.hold_info, preparedHoldInfo),
            { worker: worker._id, item: item._id, submit_to_proprietor_date: submitToProprietorDateObj, price: Number(price), deduction_from_manager: Number(deduction_from_manager), remarks_from_manager, remarks_from_proprietor, underprocessing_value: Number(underprocessing_value), is_adhoc, to_hold, hold_info: preparedHoldInfo },
            Number(quantity),
            actionDateObj,
            dateObj
        );

        if (!submissionRemoved) {
            return res.status(404).json({ message: `${quantity} of ${design_number} and is_adhoc: ${is_adhoc} not submitted to proprietor by manager: ${manager_id} on ${submit_to_proprietor_date}, made by worker: ${worker_id} with price: ${price}, deduction from manager: ${deduction_from_manager}, remarks from manager: ${remarks_from_manager}, remarks from proprietor: ${remarks_from_proprietor} and underprocessing value: ${underprocessing_value}` });
        }

        // let hmIndex = -1;

        if (to_hold) {
            // hmIndex = worker.held_by_manager.findIndex((h) => (h.item.equals(item._id) && h.quantity >= Number(quantity) && h.price === Number(price) && h.remarks_from_manager === remarks_from_manager && h.remarks_from_proprietor === remarks_from_proprietor && Number(h.underprocessing_value) === Number(underprocessing_value) && h.is_adhoc === is_adhoc && isSameHoldInfo(h.hold_info, preparedHoldInfo)));
            // if (hmIndex === -1) {
            //     return res.status(404).json({ message: `${quantity} of ${design_number} and is_adhoc: ${is_adhoc} not held by manager: ${manager_id}, made by worker: ${worker_id} with price: ${price}, remarks from manager: ${remarks_from_manager}, remarks from proprietor: ${remarks_from_proprietor} and underprocessing value: ${underprocessing_value}` });
            // }

            const proprietorActionWorkerWithHoldHistory = [
                ...worker.accepted_history.filter(ah => ah.was_to_hold).map(ah => ({ ...ah._doc, to_hold: ah.was_to_hold, action_date: ah.accept_date })),
                ...worker.on_hold_history.filter(oh => oh.was_to_hold).map(oh => ({ ...oh._doc, to_hold: oh.was_to_hold, action_date: oh.hold_date })),
                ...worker.forfeited_history.filter(fh => fh.was_to_hold).map(fh => ({ ...fh._doc, to_hold: fh.was_to_hold, action_date: fh.forfeiture_date })),
            ];

            const workerSubmitWithHoldHistory = worker.submit_history.filter(sh => sh.to_hold);

            const heldByManagerRemoved = validateAndRemoveFromTransient(
                worker.held_by_manager,
                undefined,
                workerSubmitWithHoldHistory,
                'submit_date',
                proprietorActionWorkerWithHoldHistory,
                'action_date',
                (h) => h.item.equals(item._id) && h.price === Number(price) && h.remarks_from_manager === remarks_from_manager && h.remarks_from_proprietor === remarks_from_proprietor && Number(h.underprocessing_value) === Number(underprocessing_value) && h.is_adhoc === is_adhoc && isSameHoldInfo(h.hold_info, preparedHoldInfo),
                { item: item._id, price: Number(price), remarks_from_manager, remarks_from_proprietor, underprocessing_value: Number(underprocessing_value), is_adhoc, hold_info: preparedHoldInfo },
                Number(quantity),
                actionDateObj,
                dateObj
            );

            if (!heldByManagerRemoved) {
                return res.status(404).json({ message: `${quantity} of ${design_number} and is_adhoc: ${is_adhoc} not held by manager: ${manager_id} for worker: ${worker_id}, with price: ${price}, remarks from manager: ${remarks_from_manager}, remarks from proprietor: ${remarks_from_proprietor} and underprocessing value: ${underprocessing_value}` });
            }
        }

        if (action === "accept") {

            if (Number(deduction) > (Number(price) - Number(deduction_from_manager))) {
                return res.status(400).json({ message: "Deduction can't be more than the price (remaining after deduction_from_manager)" });
            }

            if (Number(deduction) !== 0 && final_remarks === "") {
                return res.status(400).json({ message: "Final remarks are required if deduction is made by proprietor" });
            }

            if (to_hold) {
                worker.due_amount += (Number(quantity) * (Number(price) - Number(deduction)));
                manager.due_amount += (1.1 * (Number(price) - Number(deduction)) * Number(quantity));
            }
            else {
                worker.due_amount -= (Number(quantity) * Number(deduction));
                manager.due_amount += (1.1 * (Number(price) - Number(deduction) - Number(deduction_from_manager)) * Number(quantity));
            }

            manager.accepted_history.push({ worker: worker._id, accept_date: actionDateObj, submit_to_proprietor_date: submitToProprietorDateObj, item: item._id, quantity: Number(quantity), price: Number(price), deduction_from_proprietor: Number(deduction), deduction_from_manager: Number(deduction_from_manager), remarks_from_manager, underprocessing_value: Number(underprocessing_value), remarks_from_proprietor, final_remarks_from_proprietor: final_remarks, is_adhoc, hold_info: preparedHoldInfo, was_to_hold: to_hold, record_date: dateObj });

            worker.accepted_history.push({ item: item._id, quantity: Number(quantity), price: Number(price), deduction_from_proprietor: Number(deduction), deduction_from_manager: Number(deduction_from_manager), remarks_from_manager, underprocessing_value: Number(underprocessing_value), remarks_from_proprietor, final_remarks_from_proprietor: final_remarks, is_adhoc, hold_info: preparedHoldInfo, was_to_hold: to_hold, accept_date: actionDateObj, record_date: dateObj });
        }
        else if (action === "forfeit") {
            if (final_remarks === "") {
                return res.status(400).json({ message: "Final remarks are required if forfeiture is made by proprietor" });
            }

            if (to_hold) {
                worker.due_amount -= (Number(quantity) * Number(penalty));
            }
            else {
                worker.due_amount -= (Number(quantity) * (Number(penalty) + (Number(price) - Number(deduction_from_manager))));
            }

            manager.due_amount -= (Number(penalty) * Number(quantity));

            manager.forfeited_history.push({ worker: worker._id, forfeiture_date: actionDateObj, submit_to_proprietor_date: submitToProprietorDateObj, item: item._id, quantity: Number(quantity), price: Number(price), penalty: Number(penalty), deduction_from_manager: Number(deduction_from_manager), remarks_from_manager, underprocessing_value: Number(underprocessing_value), remarks_from_proprietor, final_remarks_from_proprietor: final_remarks, is_adhoc, hold_info: preparedHoldInfo, was_to_hold: to_hold, record_date: dateObj });

            worker.forfeited_history.push({ item: item._id, price: Number(price), quantity: Number(quantity), penalty: Number(penalty), underprocessing_value: Number(underprocessing_value), deduction_from_manager: Number(deduction_from_manager), remarks_from_manager: remarks_from_manager, remarks_from_proprietor: remarks_from_proprietor, submit_to_proprietor_date: submitToProprietorDateObj, forfeiture_date: actionDateObj, final_remarks_from_proprietor: final_remarks, is_adhoc: is_adhoc, hold_info: preparedHoldInfo, was_to_hold: to_hold, record_date: dateObj });
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

            manager.due_amount += (1.1 * Number(partial_payment) * Number(quantity));

            addToTransient(
                proprietor.on_hold,
                proprietor.on_hold_log,
                (oh) => oh.item.equals(item._id) && oh.price === Number(price) && oh.partial_payment === Number(partial_payment) && Number(oh.underprocessing_value) === Number(underprocessing_value) && oh.remarks_from_proprietor === remarks_from_proprietor && oh.deduction_from_manager === Number(deduction_from_manager) && oh.remarks_from_manager === remarks_from_manager && oh.put_on_hold_by === put_on_hold_by && oh.holding_remarks === final_remarks && oh.is_adhoc === is_adhoc && oh.worker.equals(worker._id) && oh.manager.equals(manager._id) && isSameDay(oh.submit_to_proprietor_date, submitToProprietorDateObj) && isSameDay(oh.hold_date, actionDateObj) && isSameHoldInfo(oh.hold_info, preparedHoldInfo),
                { item: item._id, price: Number(price), partial_payment: Number(partial_payment), underprocessing_value: Number(underprocessing_value), remarks_from_proprietor, deduction_from_manager: Number(deduction_from_manager), remarks_from_manager, put_on_hold_by, holding_remarks: final_remarks, is_adhoc, worker: worker._id, manager: manager._id, submit_to_proprietor_date: submitToProprietorDateObj, hold_date: actionDateObj, hold_info: preparedHoldInfo },
                Number(quantity),
                actionDateObj,
                dateObj
            )

            manager.on_hold_history.push({ worker: worker._id, hold_date: actionDateObj, submit_to_proprietor_date: submitToProprietorDateObj, item: item._id, quantity: Number(quantity), price: Number(price), partial_payment: Number(partial_payment), underprocessing_value: Number(underprocessing_value), remarks_from_proprietor, deduction_from_manager: Number(deduction_from_manager), remarks_from_manager, holding_remarks: final_remarks, put_on_hold_by, is_adhoc, hold_info: preparedHoldInfo, was_to_hold: to_hold, record_date: dateObj });

            worker.on_hold_history.push({ item: item._id, quantity: Number(quantity), price: Number(price), partial_payment: Number(partial_payment), underprocessing_value: Number(underprocessing_value), remarks_from_proprietor: remarks_from_proprietor, deduction_from_manager: Number(deduction_from_manager), remarks_from_manager: remarks_from_manager, submit_to_proprietor_date: submitToProprietorDateObj, hold_date: actionDateObj, put_on_hold_by, holding_remarks: final_remarks, is_adhoc, hold_info: preparedHoldInfo, was_to_hold: to_hold, record_date: dateObj });
        }

        // if (to_hold) {
        //     worker.held_by_manager[hmIndex].quantity -= Number(quantity);
        //     if (worker.held_by_manager[hmIndex].quantity === 0) {
        //         worker.held_by_manager.splice(hmIndex, 1);
        //     }
        // }

        // manager.submissions[sIndex].quantity -= Number(quantity);
        // if (manager.submissions[sIndex].quantity === 0) {
        //     manager.submissions.splice(sIndex, 1);
        // }

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


