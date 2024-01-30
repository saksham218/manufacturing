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
        const worker = await Worker.findOne({ worker_id: worker_id }).populate({ path: 'manager', model: 'Manager', select: 'proprietor' });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });

        const item = await Item.findOne({ design_number: design_number, proprietor: worker.manager.proprietor });
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

export const getPrice = async (req, res) => {
    const worker_id = req.params.worker_id;
    const design_number = req.params.design_number;
    console.log("get price worker_id: ", worker_id);
    console.log("get price design_number: ", design_number);

    try {
        const worker = await Worker.findOne({ worker_id: worker_id }).populate({ path: 'manager', model: 'Manager', select: 'proprietor' });
        if (!worker) return res.status(404).json({ message: "Worker doesn't exist" });

        const item = await Item.findOne({ design_number: design_number, proprietor: worker.manager.proprietor });
        if (!item) return res.status(404).json({ message: "Item doesn't exist" });

        const priceIndex = worker.custom_prices.findIndex((cp) => cp.item === item._id);
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
