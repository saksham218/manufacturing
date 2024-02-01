import Worker from '../models/worker.js'
import Manager from '../models/manager.js'
import Item from '../models/item.js'


export const addWorker = async (req, res) => {
    console.log(req.body);
    const manager_id = req.params.manager_id;
    console.log("add worker manager_id: ", manager_id);
    const { name, contact_number, address, worker_id } = req.body;

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

    try {
        const manager = await Manager.findOne({ manager_id: manager_id });
        if (!manager) return res.status(404).json({ message: "Manager doesn't exist" });
        //fetch only name and worker_id
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
        const worker = await Worker.findOne({ worker_id: worker_id });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });
        const [day, month, year] = date.split('/').map(Number);
        const dateObj = new Date(year, month - 1, day);
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
        const worker = await Worker.findOne({ worker_id: worker_id });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });
        res.status(200).json(worker.payment_history);
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
    const { design_number, quantity, price } = req.body;

    try {
        const worker = await Worker.findOne({ worker_id: worker_id });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });


        const manager = await Manager.findOne({ _id: worker.manager });
        const item = await Item.findOne({ design_number: design_number, proprietor: manager.proprietor });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });

        const priceIndex = worker.custom_prices.findIndex((cp) => cp.item === item._id);
        if (priceIndex !== -1) {
            if (price !== worker.custom_prices[priceIndex].price)
                return res.status(400).json({ message: "Price doesn't match" });

        }
        else {
            if (price !== item.price)
                return res.status(400).json({ message: "Price doesn't match" });
        }

        const quantityIndex = manager.due_forward.findIndex((df) => (df.item.equals(item._id) && df.quantity >= Number(quantity)));
        if (quantityIndex === -1) {
            return res.status(400).json({ message: "Quantity not available" });
        }

        manager.due_forward[quantityIndex].quantity -= Number(quantity);
        if (manager.due_forward[quantityIndex].quantity === 0)
            manager.due_forward.splice(quantityIndex, 1)
        await manager.save();








        const dateObj = new Date();
        worker.issue_history.push({ item: item._id, quantity: quantity, price: price, date: dateObj });

        const index = worker.due_items.findIndex((di) => (di.item.equals(item._id) && di.price === Number(price)));
        if (index === -1) {
            worker.due_items.push({ item: item._id, price: price, quantity: quantity });
        }
        else {
            worker.due_items[index].quantity += Number(quantity);
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
        const worker = await Worker.findOne({ worker_id: worker_id }).populate({ path: 'manager', model: 'Manager', select: 'proprietor due_forward' });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });

        const item = await Item.findOne({ design_number: design_number, proprietor: worker.manager.proprietor });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });

        var quantity = 0;
        const quantityIndex = worker.manager.due_forward.findIndex((df) => df.item.equals(item._id));
        if (quantityIndex !== -1) {
            quantity = worker.manager.due_forward[quantityIndex].quantity;
        }
        else {
            return res.status(400).json({ message: `${design_number} is not available for issue` });
        }

        const priceIndex = worker.custom_prices.findIndex((cp) => cp.item.equals(item._id));
        if (priceIndex !== -1) {
            res.status(200).json({ price: worker.custom_prices[priceIndex].price });
        }
        else {
            res.status(200).json({ price: item.price, quantity_available: quantity });
        }

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const getPricesForSubmit = async (req, res) => {
    const worker_id = req.params.worker_id;
    const design_number = req.params.design_number;
    console.log("get prices for submit worker_id: ", worker_id);
    console.log("get prices for submit design_number: ", design_number);

    try {
        console.log("hi")
        const worker = await Worker.findOne({ worker_id: worker_id }).populate({ path: 'manager', model: 'Manager', select: 'proprietor' });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });

        const item = await Item.findOne({ design_number: design_number, proprietor: worker.manager.proprietor });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });

        const quantityPrice = []
        worker.due_items.forEach((di) => {
            if (di.item.equals(item._id) && di.quantity >= 0) {
                quantityPrice.push({ price: di.price, quantity: di.quantity })
            }
        })

        if (quantityPrice.length === 0)
            return res.status(400).json({ message: `${design_number} is not issued to ${worker_id}` })

        return res.status(200).json(quantityPrice);

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
    const { design_number, quantity, price, deduction, remarks } = req.body;

    try {
        const worker = await Worker.findOne({ worker_id: worker_id });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });


        const manager = await Manager.findOne({ _id: worker.manager });
        const item = await Item.findOne({ design_number: design_number, proprietor: manager.proprietor });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });

        const quantityIndex = worker.due_items.findIndex((df) => (df.item.equals(item._id) && df.quantity >= Number(quantity) && df.price === Number(price)));
        if (quantityIndex === -1) {
            return res.status(400).json({ message: `${quantity} of ${design_number} not issued to ${worker_id} @ ${price}` });
        }

        const index = manager.due_backward.findIndex((db) => (db.item.equals(item._id)));
        if (index === -1) {
            manager.due_backward.push({ item: item._id, quantity: quantity });
        }
        else {
            manager.due_backward[index].quantity += Number(quantity);
        }
        await manager.save();

        worker.due_items[quantityIndex].quantity -= Number(quantity);
        if (worker.due_items[quantityIndex].quantity === 0)
            worker.due_items.splice(quantityIndex, 1)

        worker.due_amount += ((Number(price) - Number(deduction)) * Number(quantity))

        const dateObj = new Date();
        worker.submit_history.push({ item: item._id, quantity: quantity, price: price, deduction: deduction, remarks: remarks, date: dateObj });


        // console.log("manager: ", manager);
        await worker.save();
        res.status(200).json({ result: worker });

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
        const worker = await Worker.findOne({ worker_id: worker_id }).populate({ path: 'manager', model: 'Manager', select: 'proprietor' });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });
        const item = await Item.findOne({ design_number: design_number, proprietor: worker.manager.proprietor });
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
        const worker = await Worker.findOne({ worker_id: worker_id })
            .populate({ path: 'custom_prices.item', model: 'Item', select: 'design_number description' })
            .populate({ path: 'due_items.item', model: 'Item', select: 'design_number description' })
            .populate({ path: 'issue_history.item', model: 'Item', select: 'design_number description' })
            .populate({ path: 'submit_history.item', model: 'Item', select: 'design_number description' })


        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });
        return res.status(200).json({ result: worker });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }

}