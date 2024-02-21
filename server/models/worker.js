import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    contact_number: { type: String, required: true },
    worker_id: { type: String, required: true, unique: true },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager',
        required: true
    },
    custom_prices: {
        type: [{
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },
            price: Number
        }],
        default: []
    },
    due_items: {
        type: [{
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },
            quantity: Number,
            price: Number,
        }],
        default: []
    },
    issue_history: {
        type: [{
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },
            quantity: Number,
            underprocessing_value: Number,
            thread_raw_material: String,
            price: Number,
            remarks: String,
            date: Date,
        }],
        default: []
    },
    submit_history: {
        type: [{
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },
            quantity: Number,
            price: Number,
            deduction: Number,
            remarks: String,
            date: Date,
        }],
        default: []
    },
    due_amount: {
        type: Number,
        default: 0
    },
    payment_history: {
        type: [{
            amount: Number,
            date: Date,
            remarks: String,
        }],
        default: []
    },

});

const Worker = mongoose.model('Worker', workerSchema);
export default Worker;