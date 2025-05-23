import Worker from '../models/worker.js'
import Manager from '../models/manager.js'
import Item from '../models/item.js'
import { depopulateHoldInfo, isSameHoldInfo, prepare, workerPopulatePaths } from '../utils/utils.js';


export const addWorker = async (req, res) => {
    console.log(req.body);
    const manager_id = req.params.manager_id;
    console.log("add worker manager_id: ", manager_id);
    const { name, contact_number, address, worker_id } = req.body;

    if (!req.manager || req.manager.manager_id !== manager_id) return res.status(403).json({ message: "Access Denied" });

    try {
        const manager = await Manager.findOne({ manager_id: manager_id });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        const oldWorker = await Worker.findOne({ worker_id: worker_id });
        if (oldWorker) return res.status(400).json({ message: "Worker already exists" });
        const result = await Worker.create({ name, contact_number, address, worker_id, manager: manager._id });
        res.status(200).json({ result });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }

}

export const getWorkers = async (req, res) => {
    const manager_id = req.params.manager_id;
    console.log("get workers manager_id: ", manager_id);

    if (((!req.manager || !req.manager.manager_id) && (!req.proprietor || !req.proprietor.proprietor_id)) || (req.manager && req.manager.manager_id && manager_id !== req.manager.manager_id)) return res.status(403).json({ message: "Access Denied" });

    try {
        const manager = await Manager.findOne({ manager_id: manager_id }).populate({ path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        //fetch only name and worker_id
        if (req.proprietor && req.proprietor.proprietor_id && manager.proprietor.proprietor_id !== req.proprietor.proprietor_id) {
            console.log(req.proprietor);
            console.log(manager.proprietor);
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
        const worker = await Worker.findOne({ worker_id: worker_id }).populate({ path: 'manager', model: 'Manager', select: 'manager_id' });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });
        if (!req.manager || req.manager.manager_id !== worker.manager.manager_id) return res.status(403).json({ message: "Access Denied" });
        const [day, month, year] = date.split('/').map(Number);
        const dateObj = new Date(year, month - 1, day);
        worker.due_amount -= amount;
        worker.payment_history.push({ amount: amount, date: dateObj, remarks: remarks });
        // console.log("manager: ", manager);
        await worker.save();
        res.status(200).json({ result: worker });

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const getPayments = async (req, res) => {
    const worker_id = req.params.worker_id;
    console.log("get payments worker_id: ", worker_id);
    try {
        const worker = await Worker.findOne({ worker_id: worker_id }).populate({ path: 'manager', model: 'Manager', select: 'manager_id' });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });
        if (!req.manager || req.manager.manager_id !== worker.manager.manager_id) return res.status(403).json({ message: "Access Denied" });
        res.status(200).json({ payment_history: worker.payment_history, due_amount: worker.due_amount });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const issueToWorker = async (req, res) => {
    console.log(req.body);
    const worker_id = req.params.worker_id;
    console.log("issue to worker worker_id: ", worker_id);
    const { design_number, quantity, price, underprocessing_value, remarks, is_price_from_df, hold_info } = req.body;

    try {
        const worker = await Worker.findOne({ worker_id: worker_id });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });


        const manager = await Manager.findOne({ _id: worker.manager });
        if (!req.manager || req.manager.manager_id !== manager.manager_id) return res.status(403).json({ message: "Access Denied" });
        const item = await Item.findOne({ design_number: design_number, proprietor: manager.proprietor });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });

        if (!is_price_from_df) {
            const priceIndex = worker.custom_prices.findIndex((cp) => cp.item.equals(item._id));
            if (priceIndex !== -1) {
                if (price !== worker.custom_prices[priceIndex].price)
                    return res.status(400).json({ message: "Price doesn't match" });

            }
            else {
                if (price !== item.price)
                    return res.status(400).json({ message: "Price doesn't match" });
            }
        }

        const preparedHoldInfo = await depopulateHoldInfo(hold_info);

        const quantityIndex = manager.due_forward.findIndex((df) => {
            return (df.item.equals(item._id) && df.quantity >= Number(quantity) && df.underprocessing_value === Number(underprocessing_value) && df.remarks_from_proprietor === remarks && isSameHoldInfo(df.hold_info, preparedHoldInfo) && (!is_price_from_df || df.price === Number(price)));
        });

        if (quantityIndex === -1) {
            return res.status(400).json({ message: `Quantity not available for ${design_number}, underprocessing_value: ${underprocessing_value}, remarks_from_proprietor: ${remarks} ${is_price_from_df ? `and price: ${price}` : ''}` });
        }

        manager.due_forward[quantityIndex].quantity -= Number(quantity);
        if (manager.due_forward[quantityIndex].quantity === 0)
            manager.due_forward.splice(quantityIndex, 1)
        await manager.save();

        const dateObj = new Date();
        worker.issue_history.push({ item: item._id, quantity: quantity, price: price, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks, date: dateObj, hold_info: preparedHoldInfo });

        if (remarks === "") {
            const index = worker.due_items.findIndex((di) => (di.item.equals(item._id) && di.remarks_from_proprietor === "" && di.price === Number(price) && di.underprocessing_value === Number(underprocessing_value) && isSameHoldInfo(di.hold_info, preparedHoldInfo)));
            if (index === -1) {
                worker.due_items.push({ item: item._id, price: price, quantity: quantity, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks, hold_info: preparedHoldInfo });
            }
            else {
                worker.due_items[index].quantity += Number(quantity);
            }
        }
        else {
            worker.due_items.push({ item: item._id, price: price, quantity: quantity, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks, hold_info: preparedHoldInfo });

        }

        // console.log("manager: ", manager);
        await worker.save();
        res.status(200).json({ result: worker });

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const getPriceForIssue = async (req, res) => {
    const worker_id = req.params.worker_id;
    const design_number = req.params.design_number;
    console.log("get price worker_id: ", worker_id);
    console.log("get price design_number: ", design_number);

    try {
        const worker = await Worker.findOne({ worker_id: worker_id }).populate({ path: 'manager', model: 'Manager', select: 'manager_id proprietor due_forward' });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });

        if (!req.manager || req.manager.manager_id !== worker.manager.manager_id) return res.status(403).json({ message: "Access Denied" });

        const item = await Item.findOne({ design_number: design_number, proprietor: worker.manager.proprietor });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });

        // var quantity = 0;
        // const quantityIndex = worker.manager.due_forward.findIndex((df) => df.item.equals(item._id));
        // if (quantityIndex !== -1) {
        //     quantity = worker.manager.due_forward[quantityIndex].quantity;
        // }
        // else {
        //     return res.status(400).json({ message: `${design_number} is not available for issue` });
        // }

        const priceIndex = worker.custom_prices.findIndex((cp) => cp.item.equals(item._id));
        if (priceIndex !== -1) {
            res.status(200).json({ price: worker.custom_prices[priceIndex].price });
        }
        else {
            res.status(200).json({ price: item.price });
        }

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const getPricesForSubmitAdhoc = async (req, res) => {
    const worker_id = req.params.worker_id;
    const design_number = req.params.design_number;
    console.log("get prices for submit adhoc worker_id: ", worker_id);
    console.log("get prices for submit adhoc design_number: ", design_number);

    try {

        const worker = await Worker.findOne({ worker_id: worker_id }).populate({ path: 'manager', model: 'Manager', select: 'manager_id proprietor' });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });

        if (!req.manager || req.manager.manager_id !== worker.manager.manager_id) return res.status(403).json({ message: "Access Denied" });

        const item = await Item.findOne({ design_number: design_number, proprietor: worker.manager.proprietor });
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
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const submitFromWorker = async (req, res) => {
    console.log(req.body);
    const worker_id = req.params.worker_id;
    console.log("submit from worker worker_id: ", worker_id);
    if (!req.manager || !req.manager.manager_id) return res.status(403).json({ message: "Access Denied" });
    const manager_id = req.manager.manager_id;
    const { design_number, quantity, price, deduction, remarks, remarks_from_proprietor, underprocessing_value, is_adhoc, to_hold, hold_info } = req.body;

    try {

        console.log("is_adhoc: ", is_adhoc)

        const manager = await Manager.findOne({ manager_id: manager_id }, { password: 0 });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });

        if (manager_id !== manager.manager_id) return res.status(403).json({ message: "Access Denied" });

        const worker = await Worker.findOne({ worker_id: worker_id })
            .populate({ path: 'manager', model: 'Manager', select: 'manager_id proprietor' });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });

        if (manager_id !== worker.manager.manager_id) return res.status(403).json({ message: "Access Denied" });

        const item = await Item.findOne({ design_number: design_number, proprietor: manager.proprietor });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });

        const preparedHoldInfo = await depopulateHoldInfo(hold_info)

        let quantityIndex = -1;

        if (!is_adhoc) {
            quantityIndex = worker.due_items.findIndex((di) => (di.item.equals(item._id) && Number(di.quantity) >= Number(quantity) && Number(di.price) === Number(price) && Number(di.underprocessing_value) === Number(underprocessing_value) && di.remarks_from_proprietor === remarks_from_proprietor && isSameHoldInfo(di.hold_info, preparedHoldInfo)));
            if (quantityIndex === -1) {
                return res.status(400).json({ message: `${quantity} of ${design_number} with underprocessing value: ${underprocessing_value} and remarks from proprietor: ${remarks_from_proprietor}, not issued to ${worker_id} @ ${price}` });
            }
        }

        if (to_hold && Number(deduction) !== 0)
            return res.status(400).json({ message: "Deduction not allowed for hold" });

        if (Number(deduction) > Number(price))
            return res.status(400).json({ message: "Deduction cannot be more than price" });

        if (Number(underprocessing_value) <= 0)
            return res.status(400).json({ message: "Underprocessing value should be positive" });

        if (Number(quantity) === 0)
            return res.status(400).json({ message: "Quantity cannot be 0" });

        if (Number(deduction) !== 0 && !remarks)
            return res.status(400).json({ message: "Remarks required for deduction" });

        if (to_hold && !remarks)
            return res.status(400).json({ message: "Remarks required for hold" });

        let workerIndex = manager.due_backward.findIndex((db) => (db.worker.equals(worker._id)))
        if (workerIndex === -1) {
            manager.due_backward.push({ worker: worker._id, items: [] });
            workerIndex = manager.due_backward.length - 1;
        }

        // if (Number(deduction) !== 0 || remarks !== "") {
        //     manager.due_backward[workerIndex].items.push({ item: item._id, quantity: quantity, price: price, deduction_from_manager: Number(deduction), remarks_from_manager: remarks, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks_from_proprietor, is_adhoc: is_adhoc, to_hold: to_hold });
        // }
        // else {
        const index = manager.due_backward[workerIndex].items.findIndex((db) => (db.item.equals(item._id) && db.remarks_from_manager === remarks && db.remarks_from_proprietor === remarks_from_proprietor && Number(db.price) === Number(price) && Number(db.deduction_from_manager) === Number(deduction) && Number(db.underprocessing_value) === Number(underprocessing_value) && db.is_adhoc === is_adhoc && db.to_hold === to_hold && isSameHoldInfo(db.hold_info, preparedHoldInfo)));
        if (index === -1) {
            manager.due_backward[workerIndex].items.push({ item: item._id, quantity: quantity, price: price, deduction_from_manager: Number(deduction), remarks_from_manager: remarks, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks_from_proprietor, is_adhoc: is_adhoc, to_hold: to_hold, hold_info: preparedHoldInfo });
        }
        else {
            manager.due_backward[workerIndex].items[index].quantity += Number(quantity);
        }
        // }

        if (is_adhoc) {
            const tdIndex = manager.total_due.findIndex((td) => (td.item.equals(item._id) && td.is_adhoc && Number(td.underprocessing_value) === Number(underprocessing_value) && td.remarks_from_proprietor === remarks_from_proprietor));
            if (tdIndex === -1) {
                manager.total_due.push({ item: item._id, quantity: quantity, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks_from_proprietor, is_adhoc: true });
            }
            else {
                manager.total_due[tdIndex].quantity += Number(quantity);
            }
        }


        if (!is_adhoc) {
            worker.due_items[quantityIndex].quantity -= Number(quantity);
            if (worker.due_items[quantityIndex].quantity === 0)
                worker.due_items.splice(quantityIndex, 1)
        }

        if (!to_hold) {
            worker.due_amount += ((Number(price) - Number(deduction)) * Number(quantity))
        }
        else {
            const hmIndex = worker.held_by_manager.findIndex((hm) => (hm.item.equals(item._id) && Number(hm.price) === Number(price) && hm.remarks_from_manager === remarks && hm.remarks_from_proprietor === remarks_from_proprietor && Number(hm.underprocessing_value) === Number(underprocessing_value) && hm.is_adhoc === is_adhoc && isSameHoldInfo(hm.hold_info, preparedHoldInfo)));
            if (hmIndex === -1) {
                worker.held_by_manager.push({ item: item._id, quantity: quantity, price: price, remarks_from_manager: remarks, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks_from_proprietor, is_adhoc: is_adhoc, hold_info: preparedHoldInfo });
            }
            else {
                worker.held_by_manager[hmIndex].quantity += Number(quantity);
            }
        }


        const dateObj = new Date();
        worker.submit_history.push({ item: item._id, quantity: quantity, price: price, deduction_from_manager: Number(deduction), remarks_from_manager: remarks, underprocessing_value: underprocessing_value, remarks_from_proprietor: remarks_from_proprietor, date: dateObj, is_adhoc: is_adhoc ? true : false, hold_info: preparedHoldInfo });


        await manager.save();
        console.log("manager saved in submit from worker");
        // console.log("manager: ", manager);
        await worker.save();
        console.log("worker saved in submit from worker");

        return res.status(200).json({ result: worker });

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }

}

export const addCustomPrice = async (req, res) => {
    console.log(req.body);
    const worker_id = req.params.worker_id;
    console.log("add custom price worker_id: ", worker_id);
    const { design_number, price } = req.body;

    try {

        const worker = await Worker.findOne({ worker_id: worker_id }).populate({ path: 'manager', model: 'Manager', select: '_id proprietor', populate: { path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' } });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });
        console.log(worker);
        if (req.proprietor && req.proprietor.proprietor_id !== worker.manager.proprietor.proprietor_id) return res.status(403).json({ message: "Access Denied" });

        const item = await Item.findOne({ design_number: design_number, proprietor: worker.manager.proprietor._id });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });

        const index = worker.custom_prices.findIndex((cp) => cp.item.equals(item._id));
        if (index === -1) {
            worker.custom_prices.push({ item: item._id, price: price });
        }
        else {
            worker.custom_prices[index].price = price;
        }

        await worker.save();
        return res.status(200).json({ result: worker });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const getWorker = async (req, res) => {
    const worker_id = req.params.worker_id;
    console.log("get worker details worker_id: ", worker_id);


    try {

        //worker with manager_id and only proprietor_id of proprietor
        const worker = await Worker.findOne({ worker_id: worker_id }).populate([
            { path: 'manager', model: 'Manager', select: 'manager_id proprietor', populate: { path: 'proprietor', model: 'Proprietor', select: 'proprietor_id' } },
            { path: 'custom_prices.item', model: 'Item', select: 'design_number description' },
            { path: 'due_items.item', model: 'Item', select: 'design_number description' },
            { path: 'issue_history.item', model: 'Item', select: 'design_number description' },
            { path: 'submit_history.item', model: 'Item', select: 'design_number description' },
            { path: 'deductions_from_proprietor.item', model: 'Item', select: 'design_number description' },
            { path: 'held_by_manager.item', model: 'Item', select: 'design_number description' },
            { path: 'forfeited_history.item', model: 'Item', select: 'design_number description' },
            { path: 'on_hold_history.item', model: 'Item', select: 'design_number description' },
        ]).lean()

        console.log("worker manager", worker.manager);
        if (((!req.manager || !req.manager.manager_id) && (!req.proprietor || !req.proprietor.proprietor_id)) ||
            (req.manager && req.manager.manager_id && req.manager.manager_id !== worker.manager.manager_id) ||
            (req.proprietor && req.proprietor.proprietor_id && req.proprietor.proprietor_id !== worker.manager.proprietor.proprietor_id)) {
            // console.log(req.manager);
            // console.log(req.proprietor);
            return res.status(403).json({ message: "Access Denied" });
        }

        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });

        const preparedWorker = await prepare(workerPopulatePaths, worker, true)

        return res.status(200).json({ result: preparedWorker });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }

}