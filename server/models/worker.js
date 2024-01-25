import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    contact_number: { type: String, required: true },
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
            price: Number,
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
    due_amount: { type: Number, defualt: 0 },
    payment_history: {
        type: [{
            amount_paid: Number,
            date: Date,
        }],
        default: []
    },

});

const Worker = mongoose.model('Worker', workerSchema);
export default Worker;