import mongoose from 'mongoose'

const managerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    manager_id: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    contact_number: { type: String, required: true },
    proprietor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proprietor',
        required: true
    },
    // workers: {
    //     type: [{
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'Worker'
    //     }],
    //     default: []
    // },
    issue_history: {
        type: [{
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },
            quantity: Number,
            underprocessing_value: Number,
            thread_raw_material: String,
            general_price: Number,
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
    due_forward: {
        type: [{
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },
            quantity: Number,
        }],
        default: []
    },
    due_backward: {
        type: [{
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },
            quantity: Number,
            price: Number,
            deduction: Number,
            remarks: String,
        }],
        default: []
    },
    total_due: {
        type: [{
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },
            quantity: Number,
        }],
    },
    payment_history: {
        type: [{
            amount: Number,
            date: Date,
            remarks: String
        }],
        default: []
    },
    expense_requests: {
        type: [{
            amount: Number,
            date: Date,
            remarks: String
        }],
        default: []
    },
    due_amount: {
        type: Number,
        default: 0
    },
});

const Manager = mongoose.model('Manager', managerSchema);
export default Manager;


