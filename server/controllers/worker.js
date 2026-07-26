import Worker from '../models/worker.js';
import Manager from '../models/manager.js';
import Item from '../models/item.js';
import { addToTransient, depopulateHoldInfo, DUE_BACKWARD_KEYS, DUE_FORWARD_KEYS, DUE_ITEMS_KEYS, HELD_BY_MANAGER_KEYS, prepare, TOTAL_DUE_KEYS, validateAndRemoveFromTransient, workerPopulatePaths } from '../utils/utils.js';
import { runInTransaction, runWithOptimisticLock } from '../utils/transaction.js';
import { BusinessError } from '../utils/errors.js';

import _ from 'lodash';


export const addWorker = async (req, res) => {
    console.log(req.body);
    const manager_id = req.params.manager_id;
    console.log("add worker manager_id: ", manager_id);
    const { name, contact_number, address, worker_id } = req.body;

    if (!req.manager || req.manager.manager_id !== manager_id) return res.status(403).json({ message: "Access Denied" });

    try {
        const manager = await Manager.findOne({ manager_id });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        const oldWorker = await Worker.findOne({ worker_id });
        if (oldWorker) return res.status(400).json({ message: "Worker already exists" });
        const result = await Worker.create({ name, contact_number, address, worker_id, manager: manager._id });
        res.status(200).json({ result });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getWorkers = async (req, res) => {
    const manager_id = req.params.manager_id;
    console.log("get workers manager_id: ", manager_id);

    if (((!req.manager || !req.manager.manager_id) && (!req.proprietor || !req.proprietor.proprietor_id)) || (req.manager && req.manager.manager_id && manager_id !== req.manager.manager_id)) return res.status(403).json({ message: "Access Denied" });

    try {
        const manager = await Manager.findOne({ manager_id }).populate({ path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        if (req.proprietor && req.proprietor.proprietor_id && manager.proprietor.proprietor_id !== req.proprietor.proprietor_id) {
            return res.status(403).json({ message: "Access Denied" });
        }
        const workers = await Worker.find({ manager: manager._id }, { name: 1, worker_id: 1, _id: 0 });
        if (!workers) return res.status(404).json({ message: "No workers exist" });
        res.status(200).json(workers);
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const recordPayment = async (req, res) => {
    console.log(req.body);
    const worker_id = req.params.worker_id;
    console.log("record payment worker_id: ", worker_id);
    const { amount, date, remarks } = req.body;

    try {
        const result = await runWithOptimisticLock(async () => {
            const worker = await Worker.findOne({ worker_id }).populate({ path: 'manager', model: 'Manager', select: 'manager_id' });
            if (!worker) throw new BusinessError(404, "Worker doesn't exist");
            if (!req.manager || req.manager.manager_id !== worker.manager.manager_id) throw new BusinessError(403, "Access Denied");

            const [day, month, year] = date.split('/').map(Number);
            const dateObj = new Date(year, month - 1, day);
            worker.due_amount -= amount;
            worker.payment_history.push({ amount, date: dateObj, remarks });
            await worker.save();
            return worker;
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
    const worker_id = req.params.worker_id;
    console.log("get payments worker_id: ", worker_id);
    try {
        const worker = await Worker.findOne({ worker_id }).populate({ path: 'manager', model: 'Manager', select: 'manager_id' });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });
        if (!req.manager || req.manager.manager_id !== worker.manager.manager_id) return res.status(403).json({ message: "Access Denied" });
        res.status(200).json({ payment_history: worker.payment_history, due_amount: worker.due_amount });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const issueToWorker = async (req, res) => {
    console.log(req.body);
    const worker_id = req.params.worker_id;
    console.log("issue to worker worker_id: ", worker_id);
    const { design_number, quantity, price, underprocessing_value, remarks, is_price_from_df, hold_info, issue_date } = req.body;

    try {
        const result = await runInTransaction(async (session) => {
            const worker = await Worker.findOne({ worker_id }).session(session);
            if (!worker) throw new BusinessError(404, "Worker doesn't exist");

            const manager = await Manager.findOne({ _id: worker.manager }).session(session);
            if (!manager) throw new BusinessError(404, "Manager doesn't exist");
            if (!req.manager || req.manager.manager_id !== manager.manager_id) throw new BusinessError(403, "Access Denied");

            const item = await Item.findOne({ design_number, proprietor: manager.proprietor }).session(session);
            if (!item) throw new BusinessError(404, "Item doesn't exist");

            if (!is_price_from_df) {
                const priceIndex = worker.custom_prices.findIndex((cp) => cp.item.equals(item._id));
                if (priceIndex !== -1) {
                    if (price !== worker.custom_prices[priceIndex].price) throw new BusinessError(400, "Price doesn't match");
                } else {
                    if (price !== item.price) throw new BusinessError(400, "Price doesn't match");
                }
            }

            const preparedHoldInfo = await depopulateHoldInfo(hold_info);
            const dateObj = new Date();
            const issueDateObj = new Date(issue_date);

            const removalSuccess = validateAndRemoveFromTransient(
                manager.due_forward, manager.due_forward_log, undefined, undefined, undefined, undefined,
                { item: item._id, price: is_price_from_df ? Number(price) : null, underprocessing_value: Number(underprocessing_value), remarks_from_proprietor: remarks, hold_info: preparedHoldInfo },
                DUE_FORWARD_KEYS, Number(quantity), issueDateObj, dateObj
            );
            if (!removalSuccess) throw new BusinessError(400, `Quantity not available for ${design_number}, underprocessing_value: ${underprocessing_value}, remarks_from_proprietor: ${remarks} ${is_price_from_df ? `and price: ${price}` : ''}`);

            addToTransient(
                worker.due_items, undefined,
                worker.issue_history, 'issue_date',
                worker.submit_history.filter(sh => !sh.is_adhoc), 'submit_date',
                { item: item._id, price, underprocessing_value, remarks_from_proprietor: remarks, hold_info: preparedHoldInfo },
                DUE_ITEMS_KEYS, Number(quantity), issueDateObj, dateObj
            );

            worker.issue_history.push({ item: item._id, quantity, price, underprocessing_value, remarks_from_proprietor: remarks, hold_info: preparedHoldInfo, issue_date: issueDateObj, record_date: dateObj });

            await manager.save({ session });
            await worker.save({ session });
            return worker;
        });
        res.status(200).json({ result });
    }
    catch (error) {
        if (error instanceof BusinessError) return res.status(error.status).json({ message: error.message });
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getPriceForIssue = async (req, res) => {
    const worker_id = req.params.worker_id;
    const design_number = req.params.design_number;
    console.log("get price worker_id: ", worker_id);
    console.log("get price design_number: ", design_number);

    try {
        const worker = await Worker.findOne({ worker_id }).populate({ path: 'manager', model: 'Manager', select: 'manager_id proprietor due_forward' });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });

        if (!req.manager || req.manager.manager_id !== worker.manager.manager_id) return res.status(403).json({ message: "Access Denied" });

        const item = await Item.findOne({ design_number, proprietor: worker.manager.proprietor });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });

        const priceIndex = worker.custom_prices.findIndex((cp) => cp.item.equals(item._id));
        if (priceIndex !== -1) {
            res.status(200).json({ price: worker.custom_prices[priceIndex].price });
        } else {
            res.status(200).json({ price: item.price });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getPricesForSubmitAdhoc = async (req, res) => {
    const worker_id = req.params.worker_id;
    const design_number = req.params.design_number;
    console.log("get prices for submit adhoc worker_id: ", worker_id);
    console.log("get prices for submit adhoc design_number: ", design_number);

    try {
        const worker = await Worker.findOne({ worker_id }).populate({ path: 'manager', model: 'Manager', select: 'manager_id proprietor' });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });

        if (!req.manager || req.manager.manager_id !== worker.manager.manager_id) return res.status(403).json({ message: "Access Denied" });

        const item = await Item.findOne({ design_number, proprietor: worker.manager.proprietor });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });

        if (worker.custom_prices.length) {
            const priceIndex = worker.custom_prices.findIndex((cp) => cp.item.equals(item._id));
            if (priceIndex !== -1) {
                return res.status(200).json({ price: worker.custom_prices[priceIndex].price });
            }
        }

        return res.status(200).json({ price: item.price });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const submitFromWorker = async (req, res) => {
    console.log(req.body);
    const worker_id = req.params.worker_id;
    console.log("submit from worker worker_id: ", worker_id);
    if (!req.manager || !req.manager.manager_id) return res.status(403).json({ message: "Access Denied" });
    const manager_id = req.manager.manager_id;
    const { design_number, quantity, price, deduction, remarks, remarks_from_proprietor, underprocessing_value, is_adhoc, to_hold, submit_date, hold_info } = req.body;

    try {
        const result = await runInTransaction(async (session) => {
            const manager = await Manager.findOne({ manager_id }, { password: 0 }).session(session);
            if (!manager) throw new BusinessError(404, "Manager doesn't exist");

            const worker = await Worker.findOne({ worker_id })
                .populate({ path: 'manager', model: 'Manager', select: 'manager_id proprietor' })
                .session(session);
            if (!worker) throw new BusinessError(404, "Worker doesn't exist");
            if (manager_id !== worker.manager.manager_id) throw new BusinessError(403, "Access Denied");

            const item = await Item.findOne({ design_number, proprietor: manager.proprietor }).session(session);
            if (!item) throw new BusinessError(404, "Item doesn't exist");

            if (to_hold && Number(deduction) !== 0) throw new BusinessError(400, "Deduction not allowed for hold");
            if (Number(deduction) > Number(price)) throw new BusinessError(400, "Deduction cannot be more than price");
            if (Number(underprocessing_value) <= 0) throw new BusinessError(400, "Underprocessing value should be positive");
            if (Number(quantity) === 0) throw new BusinessError(400, "Quantity cannot be 0");
            if (Number(deduction) !== 0 && !remarks) throw new BusinessError(400, "Remarks required for deduction");
            if (to_hold && !remarks) throw new BusinessError(400, "Remarks required for hold");

            const preparedHoldInfo = await depopulateHoldInfo(hold_info);
            const dateObj = new Date();
            const submitDateObj = new Date(submit_date);

            if (!is_adhoc) {
                const removalSuccess = validateAndRemoveFromTransient(
                    worker.due_items, undefined,
                    worker.issue_history, "issue_date",
                    _.filter(worker.submit_history, (sh) => !sh.is_adhoc), "submit_date",
                    { item: item._id, price, underprocessing_value, remarks_from_proprietor, hold_info: preparedHoldInfo },
                    DUE_ITEMS_KEYS, Number(quantity), submitDateObj, dateObj
                );
                if (!removalSuccess) throw new BusinessError(400, `${quantity} of ${design_number} with underprocessing value: ${underprocessing_value} and remarks from proprietor: ${remarks_from_proprietor}, not issued to ${worker_id} @ ${price}`);
            } else {
                addToTransient(
                    manager.total_due, manager.total_due_log, null, null, null, null,
                    { item: item._id, price: Number(price), underprocessing_value: Number(underprocessing_value), remarks_from_proprietor, is_adhoc: true, hold_info: preparedHoldInfo },
                    TOTAL_DUE_KEYS, Number(quantity), submitDateObj, dateObj
                );
            }

            addToTransient(
                manager.due_backward, manager.due_backward_log, null, null, null, null,
                { worker: worker._id, item: item._id, price, deduction_from_manager: Number(deduction), underprocessing_value, remarks_from_manager: remarks, remarks_from_proprietor, is_adhoc: !!is_adhoc, to_hold: !!to_hold, hold_info: preparedHoldInfo },
                DUE_BACKWARD_KEYS, Number(quantity), submitDateObj, dateObj
            );

            if (!to_hold) {
                worker.due_amount += ((Number(price) - Number(deduction)) * Number(quantity));
            } else {
                const proprietorActionWorkerWithHoldHistory = [
                    ...worker.accepted_history.filter(ah => ah.was_to_hold).map(ah => ({ ...ah._doc, action_date: ah.accept_date })),
                    ...worker.on_hold_history.filter(oh => oh.was_to_hold).map(oh => ({ ...oh._doc, action_date: oh.hold_date })),
                    ...worker.forfeited_history.filter(fh => fh.was_to_hold).map(fh => ({ ...fh._doc, action_date: fh.forfeiture_date })),
                ];

                addToTransient(
                    worker.held_by_manager, undefined,
                    worker.submit_history.filter(sh => sh.to_hold), 'submit_date',
                    proprietorActionWorkerWithHoldHistory, 'action_date',
                    { item: item._id, price: Number(price), underprocessing_value: Number(underprocessing_value), remarks_from_manager: remarks, remarks_from_proprietor, is_adhoc: !!is_adhoc, hold_info: preparedHoldInfo },
                    HELD_BY_MANAGER_KEYS, Number(quantity), submitDateObj, dateObj
                );
            }

            worker.submit_history.push({ item: item._id, quantity: Number(quantity), price: Number(price), deduction_from_manager: Number(deduction), remarks_from_manager: remarks, underprocessing_value: Number(underprocessing_value), remarks_from_proprietor, submit_date: submitDateObj, is_adhoc: !!is_adhoc, to_hold: !!to_hold, hold_info: preparedHoldInfo, record_date: dateObj });

            await manager.save({ session });
            await worker.save({ session });
            return worker;
        });
        return res.status(200).json({ result });
    }
    catch (error) {
        if (error instanceof BusinessError) return res.status(error.status).json({ message: error.message });
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const addCustomPrice = async (req, res) => {
    console.log(req.body);
    const worker_id = req.params.worker_id;
    console.log("add custom price worker_id: ", worker_id);
    const { design_number, price } = req.body;

    try {
        const result = await runWithOptimisticLock(async () => {
            const worker = await Worker.findOne({ worker_id }).populate({ path: 'manager', model: 'Manager', select: '_id proprietor', populate: { path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' } });
            if (!worker) throw new BusinessError(404, "Worker doesn't exist");
            if (req.proprietor && req.proprietor.proprietor_id !== worker.manager.proprietor.proprietor_id) throw new BusinessError(403, "Access Denied");

            const item = await Item.findOne({ design_number, proprietor: worker.manager.proprietor._id });
            if (!item) throw new BusinessError(404, "Item doesn't exist");

            const index = worker.custom_prices.findIndex((cp) => cp.item.equals(item._id));
            if (index === -1) {
                worker.custom_prices.push({ item: item._id, price });
            } else {
                worker.custom_prices[index].price = price;
            }

            await worker.save();
            return worker;
        });
        return res.status(200).json({ result });
    }
    catch (error) {
        if (error instanceof BusinessError) return res.status(error.status).json({ message: error.message });
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getWorker = async (req, res) => {
    const worker_id = req.params.worker_id;
    console.log("get worker details worker_id: ", worker_id);

    try {
        const worker = await Worker.findOne({ worker_id }).populate([
            { path: 'manager', model: 'Manager', select: 'manager_id proprietor', populate: { path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' } },
            { path: 'custom_prices.item', model: 'Item', select: 'design_number description' },
            { path: 'due_items.item', model: 'Item', select: 'design_number description' },
            { path: 'issue_history.item', model: 'Item', select: 'design_number description' },
            { path: 'submit_history.item', model: 'Item', select: 'design_number description' },
            { path: 'accepted_history.item', model: 'Item', select: 'design_number description' },
            { path: 'held_by_manager.item', model: 'Item', select: 'design_number description' },
            { path: 'forfeited_history.item', model: 'Item', select: 'design_number description' },
            { path: 'on_hold_history.item', model: 'Item', select: 'design_number description' },
        ]).lean();

        console.log("worker manager", worker.manager);
        if (((!req.manager || !req.manager.manager_id) && (!req.proprietor || !req.proprietor.proprietor_id)) ||
            (req.manager && req.manager.manager_id && req.manager.manager_id !== worker.manager.manager_id) ||
            (req.proprietor && req.proprietor.proprietor_id && req.proprietor.proprietor_id !== worker.manager.proprietor.proprietor_id)) {
            return res.status(403).json({ message: "Access Denied" });
        }

        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });

        const preparedWorker = await prepare(workerPopulatePaths, worker, true);

        return res.status(200).json({ result: preparedWorker });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
