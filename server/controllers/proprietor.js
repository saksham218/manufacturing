import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Proprietor from "../models/proprietor.js";
import Manager from "../models/manager.js";
import Worker from "../models/worker.js";
import Item from "../models/item.js";

export const newProprietor = async (req, res) => {

    console.log(req.body);
    const { name, proprietor_id, password } = req.body;

    try {
        const oldProprietor = await Proprietor.findOne({ proprietor_id });

        if (oldProprietor) return res.status(400).json({ message: "Proprietor already exists" });

        const hashedPassword = await bcrypt.hash(password, 12);

        // const result = await Proprietor.create({ name, id, password: hashedPassword });

        const result = await Proprietor.create({ name, proprietor_id, password: hashedPassword });

        // const token = jwt.sign({ id: result._id }, process.env.SECRET_KEY, { expiresIn: "1h" });

        const proprietor_token = jwt.sign({ proprietor_id: result.proprietor_id }, process.env.SECRET_KEY, { expiresIn: "1h" });


        console.log(result);
        res.status(200).json({ result: { name: result.name, proprietor_id: result.proprietor_id }, proprietor_token });

        // res.status(200).json({ message: "Proprietor created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });

        console.log(error);
    }
};

export const loginProprietor = async (req, res) => {
    console.log(req.body);
    const { proprietor_id, password } = req.body;

    try {
        const oldProprietor = await Proprietor.findOne({ proprietor_id });

        if (!oldProprietor) return res.status(404).json({ message: "Proprietor doesn't exist" });

        const isPasswordCorrect = await bcrypt.compare(password, oldProprietor.password);

        // const isPasswordCorrect = (password === oldProprietor.password);

        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

        const proprietor_token = jwt.sign({ proprietor_id: oldProprietor.proprietor_id }, process.env.SECRET_KEY, { expiresIn: "1h" });

        // res.status(200).json({ result: oldProprietor, token });

        return res.status(200).json({ result: { proprietor_id: oldProprietor.proprietor_id, name: oldProprietor.name }, proprietor_token });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });

        console.log(error);
    }
};

export const putItemsOnHold = async (req, res) => {
    const manager_id = req.params.manager_id;
    console.log("put items on hold manager_id: ", manager_id);
    console.log("manager:", req.manager);
    console.log("proprietor:", req.proprietor);
    if (((!req.manager || !req.manager.manager_id) && (!req.proprietor || !req.proprietor.proprietor_id)) || (req.manager && req.manager.manager_id && manager_id !== req.manager.manager_id)) return res.status(401).json({ message: "Access Denied" });

    const { worker_id, design_number, quantity, price, partial_payment, underprocessing_value, remarks_from_proprietor, deduction_from_manager, remarks_from_manager, holding_remarks, is_adhoc } = req.body;

    try {
        const manager = await Manager.findOne({ manager_id: manager_id }, { id: 0, password: 0 })
            .populate([
                { path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' },
                { path: 'due_backward.worker', model: 'Worker', select: 'name worker_id' },
                { path: 'due_backward.items.item', model: 'Item', select: 'design_number description' },
                { path: 'submissions.worker', model: 'Worker', select: 'name worker_id' },
                { path: 'submissions.items.item', model: 'Item', select: 'design_number description' },
                { path: 'total_due.item', model: 'Item', select: 'design_number description' }
            ]);

        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });

        const proprietor_id = manager.proprietor.proprietor_id;

        if (req.proprietor && req.proprietor.proprietor_id && req.proprietor.proprietor_id !== proprietor_id) {
            console.log(req.proprietor);
            console.log(manager.proprietor.proprietor_id);
            return res.status(401).json({ message: "Access Denied" });
        }

        const proprietor = await Proprietor.findOne({ proprietor_id }, { id: 0, password: 0 })
            .populate([
                {}
            ]);

        if (!proprietor) return res.status(404).json({ message: "Proprietor doesn't exist" });

        const worker = await Worker.findOne({ worker_id }, { id: 0, password: 0 })
            .populate([
                { path: 'manager', model: 'Manager', select: 'manager_id proprietor', populate: { path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' } }
            ]);

        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });

        if ((req.manager && req.manager.manager_id && req.manager.manager_id !== worker.manager.manager_id) ||
            (req.proprietor && req.proprietor.proprietor_id && req.proprietor.proprietor_id !== worker.manager.proprietor.proprietor_id)) {
            // console.log(req.manager);
            // console.log(req.proprietor);
            return res.status(401).json({ message: "Access Denied" });
        }

        if (req.proprietor && req.proprietor.proprietor_id && worker.manager.manager_id !== manager_id) return res.status(404).json({ message: `Worker: ${worker_id} doesn't belong to manager: ${manager_id}` });

        const item = await Item.findOne({ design_number: design_number, proprietor: proprietor._id });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });

        if (Number(quantity) <= 0) {
            return res.status(400).json({ message: "Hold quantity should be positive" });
        }

        if (Number(partial_payment) <= 0 || Number(partial_payment) > (Number(price) - Number(deduction_from_manager))) {
            return res.status(400).json({ message: "Partial payment should be positive and less than or equal to price minus deduction from manager" });
        }

        if (holding_remarks === "") {
            return res.status(400).json({ message: "Holding remarks should not be empty" });
        }

        const tdIndex = manager.total_due.findIndex((td) => (td.item.equals(item._id) && td.quantity >= Number(quantity) && td.remarks_from_proprietor === remarks_from_proprietor && Number(td.underprocessing_value) === Number(underprocessing_value) && td.is_adhoc === is_adhoc));
        if (tdIndex === -1) {
            return res.status(404).json({ message: `${quantity} of ${design_number} and is_adhoc: ${is_adhoc} with underprocessing value: ${underprocessing_value} and remarks from proprietor: ${remarks_from_proprietor} not due at manager: ${manager_id}` });
        }

        let put_on_hold_by = "";

        if (req.manager && req.manager.manager_id) {
            put_on_hold_by = "manager";
            const dbWorkerIndex = manager.due_backward.findIndex((db) => db.worker.equals(worker._id));
            if (dbWorkerIndex === -1) return res.status(404).json({ message: `no goods due backward for worker: ${worker_id}` });

            const dbItemIndex = manager.due_backward[dbIndex].items.findIndex((i) => i.to_hold === true && i.item.equals(item._id) && Number(i.quantity) >= Number(quantity) && Number(i.price) === Number(price) && i.remarks_from_proprietor === remarks_from_proprietor && Number(i.underprocessing_value) === Number(underprocessing_value) && Number(i.deduction_from_manager) === Number(deduction_from_manager) && i.remarks_from_manager === remarks_from_manager && i.is_adhoc === is_adhoc);
            if (dbItemIndex === -1) return res.status(404).json({ message: `to hold, ${quantity} of ${design_number} and is_adhoc: ${is_adhoc} not due backward at manager: ${manager_id}, made by worker: ${worker_id} with price: ${price}, deduction from manager: ${deduction_from_manager} and remarks from manager: ${remarks_from_manager}, remarks from proprietor: ${remarks_from_proprietor} and underprocessing value: ${underprocessing_value}` });

            manager.due_backward[dbWorkerIndex].items[dbItemIndex].quantity -= Number(quantity);
            if (manager.due_backward[dbWorkerIndex].items[dbItemIndex].quantity === 0) {
                manager.due_backward[dbWorkerIndex].items.splice(dbItemIndex, 1);
            }
            if (manager.due_backward[dbWorkerIndex].items.length === 0) {
                manager.due_backward.splice(dbWorkerIndex, 1);
            }
        }

        if (req.proprietor && req.proprietor.proprietor_id) {
            put_on_hold_by = "proprietor";
            const sWorkerIndex = manager.submissions.findIndex((w) => w.worker.equals(worker._id));
            if (sWorkerIndex === -1) {
                return res.status(404).json({ message: `no goods made by worker: ${worker_id} are in submissions` });
            }

            const sItemIndex = manager.submissions[sWorkerIndex].items.findIndex((i) => i.item.equals(item._id) && Number(i.quantity) >= Number(quantity) && Number(i.price) === Number(price) && i.remarks_from_proprietor === remarks_from_proprietor && Number(i.underprocessing_value) === Number(underprocessing_value) && Number(i.deduction_from_manager) === Number(deduction_from_manager) && i.remarks_from_manager === remarks_from_manager && i.is_adhoc === is_adhoc);
            if (sItemIndex === -1) return res.status(404).json({ message: `${quantity} of ${design_number} and is_adhoc: ${is_adhoc} not submiited by manager: ${manager_id}, made by worker: ${worker_id} with price: ${price}, deduction from manager: ${deduction_from_manager}, remarks from manager: ${remarks_from_manager}, remarks from proprietor: ${remarks_from_proprietor} and underprocessing value: ${underprocessing_value}` });

            manager.submissions[sWorkerIndex].items[sItemIndex].quantity -= Number(quantity);
            if (manager.submissions[sWorkerIndex].items[sItemIndex].quantity === 0) {
                manager.submissions[sWorkerIndex].items.splice(sItemIndex, 1);
            }
            if (manager.submissions[sWorkerIndex].items.length === 0) {
                manager.submissions.splice(sWorkerIndex, 1);
            }
        }


        manager.total_due[tdIndex].quantity -= Number(quantity);
        if (manager.total_due[tdIndex].quantity === 0) {
            manager.total_due.splice(tdIndex, 1);
        }

        const current_date = new Date();

        worker.on_hold_history.push({
            item: item._id,
            quantity: Number(quantity),
            price: Number(price),
            partial_payment: Number(partial_payment),
            underprocessing_value: Number(underprocessing_value),
            remarks_from_proprietor: remarks_from_proprietor,
            deduction_from_manager: Number(deduction_from_manager),
            remarks_from_manager: remarks_from_manager,
            hold_date: current_date,
            put_on_hold_by: put_on_hold_by,
            holding_remarks: holding_remarks,
            is_adhoc: is_adhoc
        });

        worker.due_amount -= (((Number(price) - Number(deduction_from_manager)) - Number(partial_payment)) * Number(quantity));

        const manHoldIndex = manager.on_hold_history.findIndex((h) => h.worker.equals(worker._id) && isSameDay(h.hold_date, current_date));
        if (manHoldIndex === -1) {
            manager.on_hold_history.push({
                worker: worker._id,
                hold_date: current_date,
                items: [{
                    item: item._id,
                    quantity: Number(quantity),
                    price: Number(price),
                    partial_payment: Number(partial_payment),
                    underprocessing_value: Number(underprocessing_value),
                    remarks_from_proprietor: remarks_from_proprietor,
                    deduction_from_manager: Number(deduction_from_manager),
                    remarks_from_manager: remarks_from_manager,
                    holding_remarks: holding_remarks,
                    put_on_hold_by: put_on_hold_by,
                    is_adhoc: is_adhoc
                }]
            });
        } else {
            manager.on_hold_history[manHoldIndex].items.push({
                item: item._id,
                quantity: Number(quantity),
                price: Number(price),
                partial_payment: Number(partial_payment),
                underprocessing_value: Number(underprocessing_value),
                remarks_from_proprietor: remarks_from_proprietor,
                deduction_from_manager: Number(deduction_from_manager),
                remarks_from_manager: remarks_from_manager,
                holding_remarks: holding_remarks,
                put_on_hold_by: put_on_hold_by,
                is_adhoc: is_adhoc
            });
        }

        manager.due_amount += (1.1 * Number(partial_payment) * Number(quantity));

        proprietor.on_hold.push({
            item: item._id,
            quantity: Number(quantity),
            price: Number(price),
            partial_payment: Number(partial_payment),
            underprocessing_value: Number(underprocessing_value),
            remarks_from_proprietor: remarks_from_proprietor,
            deduction_from_manager: Number(deduction_from_manager),
            remarks_from_manager: remarks_from_manager,
            holding_remarks: holding_remarks,
            put_on_hold_by: put_on_hold_by,
            is_adhoc: is_adhoc,
            worker: worker._id,
            manager: manager._id
        });

        await proprietor.save();
        await manager.save();
        await worker.save();

        if (req.manager && req.manager.manager_id) {
            return res.status(200).json({ result: manager });
        }

        if (req.proprietor && req.proprietor.proprietor_id) {
            return res.status(200).json({ result: proprietor });
        }

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });

        console.log(error);
    }
};

const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
}

