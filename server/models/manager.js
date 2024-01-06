import mongoose from 'mongoose'

const managerSchema = new mongoose.Schema({
    name: String,
    id: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    address: String,
    contact_number: String,
    proprietor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proprietor'
    },
    workers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker'
    }],
    issue_history: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        },
        quantity: Number,
        date: Date,
    }],
    submit_history: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        },
        quantity: Number,
        date: Date,
    }],
    due_forward_items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }],
    due_forward_quantity: [Number],
    due_backward_items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }],
    due_backward_quantity: [Number],
    payment_history: [{
        amount_paid: Number,
        date: Date,
    }],
});

const Manager = mongoose.model('Manager', managerSchema);
export default Manager;


