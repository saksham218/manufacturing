import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema({
    name: String,
    address: String,
    contact_number: String,
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager'
    },
    custom_price_item: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }],
    custom_price: [Number],
    due_items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }],
    due_quantity: [Number],
    issue_history: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        },
        quantity: Number,
        price: Number,
        date: Date,
    }],
    submit_history: [{
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
    due_amount: Number,
    payment_history: [{
        amount_paid: Number,
        date: Date,
    }],

});

const Worker = mongoose.model('Worker', workerSchema);
export default Worker;