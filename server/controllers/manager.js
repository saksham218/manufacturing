import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Manager from "../models/manager.js";
import Worker from "../models/worker.js";
import Proprietor from "../models/proprietor.js";
import Item from "../models/item.js";
import { addToTransient, validateAndRemoveFromTransient, depopulateHoldInfo, DUE_BACKWARD_KEYS, DUE_FORWARD_KEYS, HELD_BY_MANAGER_KEYS, ON_HOLD_KEYS, getRemovalQuantitiesFromTransient, managerPopulatePaths, prepare, SUBMISSIONS_KEYS, TOTAL_DUE_KEYS } from "../utils/utils.js";
import { runInTransaction, runWithOptimisticLock } from "../utils/transaction.js";
import { BusinessError } from "../utils/errors.js";

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
            return res.status(403).json({ message: "Access Denied" });
        }

        const managerPrepared = await prepare(managerPopulatePaths, manager, true);

        res.status(200).json(managerPrepared);
    }
    catch (error) {
        console.log(error);
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
        const result = await runWithOptimisticLock(async () => {
            const manager = await Manager.findOne({ manager_id }).populate({ path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' });
            if (!manager) throw new BusinessError(404, "Manager doesn't exist");
            if (!req.proprietor || req.proprietor.proprietor_id !== manager.proprietor.proprietor_id) throw new BusinessError(403, "Access Denied");

            const [day, month, year] = date.split('/').map(Number);
            const dateObj = new Date(year, month - 1, day);
            manager.payment_history.push({ amount, date: dateObj, remarks });
            manager.due_amount -= Number(amount);
            await manager.save();
            return manager;
        });
        res.status(200).json({ result });
    }
    catch (error) {
        if (error instanceof BusinessError) return res.status(error.status).json({ message: error.message });
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getPayments = async (req, res) => {
    const manager_id = req.params.manager_id;
    console.log("get payments manager_id: ", manager_id);

    try {
        const manager = await Manager.findOne({ manager_id }).populate({ path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        if (!req.proprietor || req.proprietor.proprietor_id !== manager.proprietor.proprietor_id) return res.status(403).json({ message: "Access Denied" });
        return res.status(200).json({ payment_history: manager.payment_history, due_amount: manager.due_amount });
    }
    catch (error) {
        console.log(error);
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
        const result = await runWithOptimisticLock(async () => {
            const manager = await Manager.findOne({ manager_id }).populate({ path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' });
            if (!manager) throw new BusinessError(404, "Manager doesn't exist");
            if (proprietor_id !== manager.proprietor.proprietor_id) throw new BusinessError(403, "Access Denied");

            const item = await Item.findOne({ design_number, proprietor: manager.proprietor });
            if (!item) throw new BusinessError(404, "Item doesn't exist");

            if (Number(quantity) <= 0) throw new BusinessError(400, "Quantity should be positive");
            if (item.price !== Number(general_price)) throw new BusinessError(400, "General price doesn't match");

            const dateObj = new Date();
            const issueDateObj = new Date(issue_date);

            manager.issue_history.push({ item: item._id, quantity, underprocessing_value, general_price, remarks_from_proprietor: remarks, issue_date: issueDateObj, record_date: dateObj });

            addToTransient(
                manager.total_due, manager.total_due_log, null, null, null, null,
                { item: item._id, price: null, underprocessing_value, remarks_from_proprietor: remarks, is_adhoc: false, hold_info: null },
                TOTAL_DUE_KEYS, quantity, issueDateObj, dateObj
            );

            addToTransient(
                manager.due_forward, manager.due_forward_log, null, null, null, null,
                { item: item._id, price: null, underprocessing_value, remarks_from_proprietor: remarks, hold_info: null },
                DUE_FORWARD_KEYS, quantity, issueDateObj, dateObj
            );

            await manager.save();
            return manager;
        });
        return res.status(200).json({ result });
    }
    catch (error) {
        if (error instanceof BusinessError) return res.status(error.status).json({ message: error.message });
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const issueOnHoldItemsToManager = async (req, res) => {
    console.log(req.body);
    const new_manager_id = req.params.manager_id;
    console.log("issue on hold items to manager manager_id: ", new_manager_id);
    if (!req.proprietor || !req.proprietor.proprietor_id) return res.status(403).json({ message: "Access Denied" });
    const proprietor_id = req.proprietor.proprietor_id;
    const { design_number, quantity, new_price, new_underprocessing_value, new_remarks_from_proprietor, price, partial_payment, underprocessing_value, remarks_from_proprietor, deduction_from_manager, remarks_from_manager, hold_date, put_on_hold_by, holding_remarks, is_adhoc, worker_id, manager_id, submit_to_proprietor_date, hold_info, issue_date } = req.body;

    try {
        const result = await runInTransaction(async (session) => {
            const newManager = await Manager.findOne({ manager_id: new_manager_id }, { password: 0 })
                .populate({ path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' })
                .session(session);
            if (!newManager) throw new BusinessError(404, "Manager doesn't exist");
            if (newManager.proprietor.proprietor_id !== proprietor_id) throw new BusinessError(403, "Access Denied");

            const proprietor = await Proprietor.findOne({ proprietor_id }, { password: 0 }).session(session);
            if (!proprietor) throw new BusinessError(404, "Proprietor doesn't exist");

            const manager = await Manager.findOne({ manager_id }, { password: 0 })
                .populate({ path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' })
                .session(session);
            if (!manager) throw new BusinessError(404, "Manager doesn't exist");
            if (proprietor_id !== manager.proprietor.proprietor_id) throw new BusinessError(403, "Access Denied");

            const worker = await Worker.findOne({ worker_id })
                .populate({ path: 'manager', model: 'Manager', select: 'manager_id proprietor', populate: { path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' } })
                .session(session);
            if (!worker) throw new BusinessError(404, "Worker doesn't exist");
            if (proprietor_id !== worker.manager.proprietor.proprietor_id) throw new BusinessError(403, "Access Denied");
            if (worker.manager.manager_id !== manager_id) throw new BusinessError(404, `Worker: ${worker_id} doesn't belong to manager: ${manager_id}`);

            const item = await Item.findOne({ design_number, proprietor: proprietor._id }).session(session);
            if (!item) throw new BusinessError(404, "Item doesn't exist");

            if (Number(quantity) <= 0) throw new BusinessError(400, "Quantity should be positive");
            if (Number(new_price) <= 0) throw new BusinessError(400, "New price should be positive");
            if (Number(new_underprocessing_value) <= 0) throw new BusinessError(400, "New underprocessing value should be positive");

            const preparedHoldInfo = await depopulateHoldInfo(hold_info);
            const holdDateObj = new Date(hold_date);
            const submitToProprietorDateObj = new Date(submit_to_proprietor_date);
            const issueDateObj = new Date(issue_date);
            const dateObj = new Date();

            const removalSuccess = validateAndRemoveFromTransient(
                proprietor.on_hold, proprietor.on_hold_log, undefined, undefined, undefined, undefined,
                { item: item._id, price: Number(price), partial_payment: Number(partial_payment), underprocessing_value: Number(underprocessing_value), remarks_from_proprietor, deduction_from_manager: Number(deduction_from_manager), remarks_from_manager, put_on_hold_by, holding_remarks, is_adhoc, worker: worker._id, manager: manager._id, hold_date: holdDateObj, submit_to_proprietor_date: submitToProprietorDateObj, hold_info: preparedHoldInfo },
                ON_HOLD_KEYS, Number(quantity), issueDateObj, dateObj
            );
            if (!removalSuccess) throw new BusinessError(400, `${quantity} of ${design_number} submitted to proprietor on ${submit_to_proprietor_date}, not on hold at proprietor: ${proprietor_id}, with price: ${price}, partial payment: ${partial_payment}, underprocessing value: ${underprocessing_value}, remarks from proprietor: ${remarks_from_proprietor}, deduction from manager: ${deduction_from_manager}, remarks from manager: ${remarks_from_manager}, holding remarks: ${holding_remarks} and is_adhoc: ${is_adhoc}, put on hold by: ${put_on_hold_by}, manager: ${manager_id}, worker: ${worker_id}`);

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
                newManager.total_due, newManager.total_due_log, null, null, null, null,
                { item: item._id, price: Number(new_price), underprocessing_value: Number(new_underprocessing_value), remarks_from_proprietor: new_remarks_from_proprietor, is_adhoc: false, hold_info: new_hold_info },
                TOTAL_DUE_KEYS, quantity, issueDateObj, dateObj
            );

            addToTransient(
                newManager.due_forward, newManager.due_forward_log, null, null, null, null,
                { item: item._id, price: Number(new_price), underprocessing_value: Number(new_underprocessing_value), remarks_from_proprietor: new_remarks_from_proprietor, hold_info: new_hold_info },
                DUE_FORWARD_KEYS, quantity, issueDateObj, dateObj
            );

            await newManager.save({ session });
            await proprietor.save({ session });
            return newManager;
        });
        return res.status(200).json({ result });
    }
    catch (error) {
        if (error instanceof BusinessError) return res.status(error.status).json({ message: error.message });
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const submitToProprietor = async (req, res) => {
    const manager_id = req.params.manager_id;
    const { worker_id, design_number, quantity, price, deduction_from_manager, submit_date, remarks_from_manager, underprocessing_value, remarks_from_proprietor, is_adhoc, to_hold, hold_info } = req.body;

    if (!req.manager || req.manager.manager_id !== manager_id) return res.status(403).json({ message: "Access Denied" });

    try {
        const result = await runWithOptimisticLock(async () => {
            const manager = await Manager.findOne({ manager_id });
            if (!manager) throw new BusinessError(404, "Manager doesn't exist");

            const worker = await Worker.findOne({ worker_id, manager: manager._id });
            if (!worker) throw new BusinessError(404, "Worker doesn't exist");

            const item = await Item.findOne({ design_number, proprietor: manager.proprietor });
            if (!item) throw new BusinessError(404, "Item doesn't exist");

            const dateObj = new Date();
            const submitDateObj = new Date(submit_date);
            const preparedHoldInfo = await depopulateHoldInfo(hold_info);

            const removalSuccess = validateAndRemoveFromTransient(
                manager.due_backward, manager.due_backward_log, undefined, undefined, undefined, undefined,
                { worker: worker._id, item: item._id, price: Number(price), deduction_from_manager: Number(deduction_from_manager), underprocessing_value: Number(underprocessing_value), remarks_from_manager, remarks_from_proprietor, is_adhoc, to_hold, hold_info: preparedHoldInfo },
                DUE_BACKWARD_KEYS, Number(quantity), submitDateObj, dateObj
            );
            if (!removalSuccess) throw new BusinessError(404, `${quantity} of ${design_number} with is_adhoc: ${is_adhoc}, to_hold: ${to_hold}, price: ${price}, deduction_from_manager: ${deduction_from_manager}, remarks_from_manager: ${remarks_from_manager}, remarks_from_proprietor: ${remarks_from_proprietor}, underprocessing_value: ${underprocessing_value} not due backward at manager: ${manager_id} for worker: ${worker_id}`);

            const proprietorActionManagerHistory = [
                ...manager.accepted_history.map(ah => ({ ...ah._doc, to_hold: ah.was_to_hold, action_date: ah.accept_date })),
                ...manager.on_hold_history.map(oh => ({ ...oh._doc, to_hold: oh.was_to_hold, action_date: oh.hold_date })),
                ...manager.forfeited_history.map(fh => ({ ...fh._doc, to_hold: fh.was_to_hold, action_date: fh.forfeiture_date })),
            ];

            const submissionAdditionHistory = manager.submit_history.map(sh => ({ ...sh._doc, submit_to_proprietor_date: sh.submit_date }));

            addToTransient(
                manager.submissions, null,
                submissionAdditionHistory, 'submit_to_proprietor_date',
                proprietorActionManagerHistory, 'action_date',
                { worker: worker._id, item: item._id, submit_to_proprietor_date: submitDateObj, price: Number(price), deduction_from_manager: Number(deduction_from_manager), underprocessing_value: Number(underprocessing_value), remarks_from_manager, remarks_from_proprietor, is_adhoc, to_hold, hold_info: preparedHoldInfo },
                SUBMISSIONS_KEYS, Number(quantity), submitDateObj, dateObj
            );

            manager.submit_history.push({
                submit_date: submitDateObj, item: item._id, quantity: Number(quantity), price: Number(price),
                underprocessing_value: Number(underprocessing_value), remarks_from_proprietor,
                deduction_from_manager: Number(deduction_from_manager), remarks_from_manager,
                is_adhoc, to_hold, hold_info: preparedHoldInfo, worker: worker._id, record_date: dateObj
            });

            await manager.save();
            return manager;
        });
        return res.status(200).json({ result });
    }
    catch (error) {
        if (error instanceof BusinessError) return res.status(error.status).json({ message: error.message });
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const raiseExpenseRequest = async (req, res) => {
    console.log(req.body);
    const manager_id = req.params.manager_id;
    console.log(`raise expense request manager_id: ${manager_id}`);
    const { amount, remarks } = req.body;

    if (!req.manager || req.manager.manager_id !== manager_id) return res.status(403).json({ message: "Access Denied" });

    try {
        const result = await runWithOptimisticLock(async () => {
            const manager = await Manager.findOne({ manager_id });
            if (!manager) throw new BusinessError(404, "Manager doesn't exist");

            const dateObj = new Date();
            if (!manager.expense_requests) manager.expense_requests = [];
            manager.expense_requests.push({ amount, remarks, date: dateObj });
            manager.due_amount += Number(amount);
            await manager.save();
            return manager;
        });
        return res.status(200).json({ result });
    }
    catch (error) {
        if (error instanceof BusinessError) return res.status(error.status).json({ message: error.message });
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const loginManager = async (req, res) => {
    console.log(req.body);
    const { manager_id, password } = req.body;
    console.log(req.headers.authorization);

    try {
        const oldManager = await Manager.findOne({ manager_id }, { password: 1, name: 1, manager_id: 1 }).populate({ path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' });

        if (!oldManager) return res.status(404).json({ message: "Manager doesn't exist" });

        const isPasswordCorrect = await bcrypt.compare(password, oldManager.password);

        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

        const manager_token = jwt.sign({ manager_id: oldManager.manager_id }, process.env.SECRET_KEY, { expiresIn: "1h" });

        return res.status(200).json({ result: { manager_id: oldManager.manager_id, name: oldManager.name, proprietor_id: oldManager.proprietor.proprietor_id }, manager_token });
    }
    catch (error) {
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
        const manager = await Manager.findOne({ manager_id });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        const item = await Item.findOne({ design_number, proprietor: manager.proprietor });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });
        const prices = manager.due_backward.filter((db) => db.item.equals(item._id)).map((db) => ({ quantity: db.quantity, price: db.price, deduction: db.deduction ? db.deduction : 0, remarks: db.remarks }));
        res.status(200).json(prices);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getSubmissions = async (req, res) => {
    const manager_id = req.params.manager_id;
    const { accept_date } = req.body;

    try {
        const manager = await Manager.findOne({ manager_id })
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
            ...peparedManager.accepted_history.map(ah => ({ ...ah, to_hold: ah.was_to_hold, action_date: ah.accept_date })),
            ...peparedManager.on_hold_history.map(oh => ({ ...oh, to_hold: oh.was_to_hold, action_date: oh.hold_date })),
            ...peparedManager.forfeited_history.map(fh => ({ ...fh, to_hold: fh.was_to_hold, action_date: fh.forfeiture_date })),
        ];

        const submissions = getRemovalQuantitiesFromTransient(
            peparedManager.submissions, undefined,
            additionHistory, 'submit_date',
            removalHistory, 'action_date',
            SUBMISSIONS_KEYS, accept_date
        );

        return res.status(200).json(submissions);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const acceptFromManager = async (req, res) => {
    console.log(req.body);
    const manager_id = req.params.manager_id;
    console.log(`accept from manager manager_id: ${manager_id}`);
    if (!req.proprietor || !req.proprietor.proprietor_id) return res.status(403).json({ message: "Access Denied" });
    const proprietor_id = req.proprietor.proprietor_id;
    const { action, worker_id, design_number, price, partial_payment, deduction_from_manager, remarks_from_manager, underprocessing_value, remarks_from_proprietor, quantity, deduction, penalty, final_remarks, is_adhoc, to_hold, action_date, submit_to_proprietor_date, hold_info } = req.body;

    if (!["hold", "forfeit", "accept"].includes(action)) return res.status(400).json({ message: "Action should be either hold, forfeit or accept" });

    try {
        const result = await runInTransaction(async (session) => {
            const proprietor = await Proprietor.findOne({ proprietor_id }, { password: 0 }).session(session);
            if (!proprietor) throw new BusinessError(404, "Proprietor doesn't exist");

            const manager = await Manager.findOne({ manager_id }, { password: 0 })
                .populate({ path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' })
                .session(session);
            if (!manager) throw new BusinessError(404, "Manager doesn't exist");
            if (proprietor_id !== manager.proprietor.proprietor_id) throw new BusinessError(403, "Access Denied");

            const worker = await Worker.findOne({ worker_id, manager: manager._id }).session(session);
            if (!worker) throw new BusinessError(404, "Worker doesn't exist");

            const item = await Item.findOne({ design_number, proprietor: manager.proprietor._id }).session(session);
            if (!item) throw new BusinessError(404, "Item doesn't exist");

            if (Number(quantity) <= 0) throw new BusinessError(400, "Accept/Forfeit/Hold quantity should be positive");

            const actionDateObj = new Date(action_date);
            const submitToProprietorDateObj = new Date(submit_to_proprietor_date);
            const dateObj = new Date();
            const preparedHoldInfo = await depopulateHoldInfo(hold_info);

            const totalDueRemoved = validateAndRemoveFromTransient(
                manager.total_due, manager.total_due_log, undefined, undefined, undefined, undefined,
                { item: item._id, price: (is_adhoc || (preparedHoldInfo && preparedHoldInfo.is_hold)) ? Number(price) : null, underprocessing_value: Number(underprocessing_value), remarks_from_proprietor, is_adhoc, hold_info: preparedHoldInfo },
                TOTAL_DUE_KEYS, Number(quantity), actionDateObj, dateObj
            );
            if (!totalDueRemoved) throw new BusinessError(404, `${quantity} of ${design_number} and is_adhoc: ${is_adhoc} with underprocessing value: ${underprocessing_value} and remarks from proprietor: ${remarks_from_proprietor} not due at manager: ${manager_id}`);

            const proprietorActionManagerHistory = [
                ...manager.accepted_history.map(ah => ({ ...ah._doc, to_hold: ah.was_to_hold, action_date: ah.accept_date })),
                ...manager.on_hold_history.map(oh => ({ ...oh._doc, to_hold: oh.was_to_hold, action_date: oh.hold_date })),
                ...manager.forfeited_history.map(fh => ({ ...fh._doc, to_hold: fh.was_to_hold, action_date: fh.forfeiture_date })),
            ];
            const submissionAdditionHistory = manager.submit_history.map(sh => ({ ...sh._doc, submit_to_proprietor_date: sh.submit_date }));

            const submissionRemoved = validateAndRemoveFromTransient(
                manager.submissions, undefined,
                submissionAdditionHistory, 'submit_date',
                proprietorActionManagerHistory, 'action_date',
                { worker: worker._id, item: item._id, submit_to_proprietor_date: submitToProprietorDateObj, price: Number(price), deduction_from_manager: Number(deduction_from_manager), underprocessing_value: Number(underprocessing_value), remarks_from_manager, remarks_from_proprietor, is_adhoc, to_hold, hold_info: preparedHoldInfo },
                SUBMISSIONS_KEYS, Number(quantity), actionDateObj, dateObj
            );
            if (!submissionRemoved) throw new BusinessError(404, `${quantity} of ${design_number} and is_adhoc: ${is_adhoc} not submitted to proprietor by manager: ${manager_id} on ${submit_to_proprietor_date}, made by worker: ${worker_id} with price: ${price}, deduction from manager: ${deduction_from_manager}, remarks from manager: ${remarks_from_manager}, remarks from proprietor: ${remarks_from_proprietor} and underprocessing value: ${underprocessing_value}`);

            if (to_hold) {
                const proprietorActionWorkerWithHoldHistory = [
                    ...worker.accepted_history.filter(ah => ah.was_to_hold).map(ah => ({ ...ah._doc, to_hold: ah.was_to_hold, action_date: ah.accept_date })),
                    ...worker.on_hold_history.filter(oh => oh.was_to_hold).map(oh => ({ ...oh._doc, to_hold: oh.was_to_hold, action_date: oh.hold_date })),
                    ...worker.forfeited_history.filter(fh => fh.was_to_hold).map(fh => ({ ...fh._doc, to_hold: fh.was_to_hold, action_date: fh.forfeiture_date })),
                ];
                const workerSubmitWithHoldHistory = worker.submit_history.filter(sh => sh.to_hold);

                const heldByManagerRemoved = validateAndRemoveFromTransient(
                    worker.held_by_manager, undefined,
                    workerSubmitWithHoldHistory, 'submit_date',
                    proprietorActionWorkerWithHoldHistory, 'action_date',
                    { item: item._id, price: Number(price), underprocessing_value: Number(underprocessing_value), remarks_from_manager, remarks_from_proprietor, is_adhoc, hold_info: preparedHoldInfo },
                    HELD_BY_MANAGER_KEYS, Number(quantity), actionDateObj, dateObj
                );
                if (!heldByManagerRemoved) throw new BusinessError(404, `${quantity} of ${design_number} and is_adhoc: ${is_adhoc} not held by manager: ${manager_id} for worker: ${worker_id}, with price: ${price}, remarks from manager: ${remarks_from_manager}, remarks from proprietor: ${remarks_from_proprietor} and underprocessing value: ${underprocessing_value}`);
            }

            if (action === "accept") {
                if (Number(deduction) > (Number(price) - Number(deduction_from_manager))) throw new BusinessError(400, "Deduction can't be more than the price (remaining after deduction_from_manager)");
                if (Number(deduction) !== 0 && final_remarks === "") throw new BusinessError(400, "Final remarks are required if deduction is made by proprietor");

                if (to_hold) {
                    worker.due_amount += (Number(quantity) * (Number(price) - Number(deduction)));
                    manager.due_amount += (1.1 * (Number(price) - Number(deduction)) * Number(quantity));
                } else {
                    worker.due_amount -= (Number(quantity) * Number(deduction));
                    manager.due_amount += (1.1 * (Number(price) - Number(deduction) - Number(deduction_from_manager)) * Number(quantity));
                }

                manager.accepted_history.push({ worker: worker._id, accept_date: actionDateObj, submit_to_proprietor_date: submitToProprietorDateObj, item: item._id, quantity: Number(quantity), price: Number(price), deduction_from_proprietor: Number(deduction), deduction_from_manager: Number(deduction_from_manager), remarks_from_manager, underprocessing_value: Number(underprocessing_value), remarks_from_proprietor, final_remarks_from_proprietor: final_remarks, is_adhoc, hold_info: preparedHoldInfo, was_to_hold: to_hold, record_date: dateObj });
                worker.accepted_history.push({ item: item._id, quantity: Number(quantity), price: Number(price), deduction_from_proprietor: Number(deduction), deduction_from_manager: Number(deduction_from_manager), remarks_from_manager, underprocessing_value: Number(underprocessing_value), remarks_from_proprietor, final_remarks_from_proprietor: final_remarks, is_adhoc, hold_info: preparedHoldInfo, was_to_hold: to_hold, submit_to_proprietor_date: submitToProprietorDateObj, accept_date: actionDateObj, record_date: dateObj });

            } else if (action === "forfeit") {
                if (final_remarks === "") throw new BusinessError(400, "Final remarks are required if forfeiture is made by proprietor");

                if (to_hold) {
                    worker.due_amount -= (Number(quantity) * Number(penalty));
                } else {
                    worker.due_amount -= (Number(quantity) * (Number(penalty) + (Number(price) - Number(deduction_from_manager))));
                }
                manager.due_amount -= (Number(penalty) * Number(quantity));

                manager.forfeited_history.push({ worker: worker._id, forfeiture_date: actionDateObj, submit_to_proprietor_date: submitToProprietorDateObj, item: item._id, quantity: Number(quantity), price: Number(price), penalty: Number(penalty), deduction_from_manager: Number(deduction_from_manager), remarks_from_manager, underprocessing_value: Number(underprocessing_value), remarks_from_proprietor, final_remarks_from_proprietor: final_remarks, is_adhoc, hold_info: preparedHoldInfo, was_to_hold: to_hold, record_date: dateObj });
                worker.forfeited_history.push({ item: item._id, price: Number(price), quantity: Number(quantity), penalty: Number(penalty), underprocessing_value: Number(underprocessing_value), deduction_from_manager: Number(deduction_from_manager), remarks_from_manager, remarks_from_proprietor, submit_to_proprietor_date: submitToProprietorDateObj, forfeiture_date: actionDateObj, final_remarks_from_proprietor: final_remarks, is_adhoc, hold_info: preparedHoldInfo, was_to_hold: to_hold, record_date: dateObj });

            } else if (action === "hold") {
                if (Number(partial_payment) < 0 || Number(partial_payment) > (Number(price) - Number(deduction_from_manager))) throw new BusinessError(400, "Partial payment should be non-negative and less than or equal to price minus deduction from manager");
                if (final_remarks === "") throw new BusinessError(400, "Holding remarks should not be empty");

                const put_on_hold_by = to_hold ? "manager" : "proprietor";

                if (to_hold) {
                    worker.due_amount += (Number(partial_payment) * Number(quantity));
                } else {
                    worker.due_amount -= (((Number(price) - Number(deduction_from_manager)) - Number(partial_payment)) * Number(quantity));
                }
                manager.due_amount += (1.1 * Number(partial_payment) * Number(quantity));

                addToTransient(
                    proprietor.on_hold, proprietor.on_hold_log, null, null, null, null,
                    { item: item._id, price: Number(price), partial_payment: Number(partial_payment), underprocessing_value: Number(underprocessing_value), remarks_from_proprietor, deduction_from_manager: Number(deduction_from_manager), remarks_from_manager, put_on_hold_by, holding_remarks: final_remarks, is_adhoc, worker: worker._id, manager: manager._id, hold_date: actionDateObj, submit_to_proprietor_date: submitToProprietorDateObj, hold_info: preparedHoldInfo },
                    ON_HOLD_KEYS, Number(quantity), actionDateObj, dateObj
                );

                manager.on_hold_history.push({ worker: worker._id, hold_date: actionDateObj, submit_to_proprietor_date: submitToProprietorDateObj, item: item._id, quantity: Number(quantity), price: Number(price), partial_payment: Number(partial_payment), underprocessing_value: Number(underprocessing_value), remarks_from_proprietor, deduction_from_manager: Number(deduction_from_manager), remarks_from_manager, holding_remarks: final_remarks, put_on_hold_by, is_adhoc, hold_info: preparedHoldInfo, was_to_hold: to_hold, record_date: dateObj });
                worker.on_hold_history.push({ item: item._id, quantity: Number(quantity), price: Number(price), partial_payment: Number(partial_payment), underprocessing_value: Number(underprocessing_value), remarks_from_proprietor, deduction_from_manager: Number(deduction_from_manager), remarks_from_manager, submit_to_proprietor_date: submitToProprietorDateObj, hold_date: actionDateObj, put_on_hold_by, holding_remarks: final_remarks, is_adhoc, hold_info: preparedHoldInfo, was_to_hold: to_hold, record_date: dateObj });
            }

            await manager.save({ session });
            await worker.save({ session });
            await proprietor.save({ session });
            return manager;
        });
        return res.status(200).json({ result });
    }
    catch (error) {
        if (error instanceof BusinessError) return res.status(error.status).json({ message: error.message });
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
