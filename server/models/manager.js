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
            // thread_raw_material: String,
            general_price: Number,
            remarks_from_proprietor: String,
            date: Date,
        }],
        default: []
    },
    accepted_history: {
        type: [{
            worker: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Worker'
            },
            items: [{
                item: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Item'
                },
                quantity: Number,
                price: Number,
                deduction_from_proprietor: Number,
                final_remarks_from_proprietor: String,
                deduction_from_manager: Number,
                remarks_from_manager: String,
                underprocessing_value: Number,
                remarks_from_proprietor: String,
                date: Date,
                is_adhoc: {
                    type: Boolean,
                    default: false
                },
            }],
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
            underprocessing_value: Number,
            // thread_raw_material: String,
            remarks_from_proprietor: String,
        }],
        default: []
    },
    due_backward: {
        type: [{
            worker: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Worker'
            },
            items: [{
                item: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Item'
                },
                quantity: Number,
                price: Number,
                deduction_from_manager: Number,
                remarks_from_manager: String,
                underprocessing_value: Number,
                remarks_from_proprietor: String,
                is_adhoc: {
                    type: Boolean,
                    default: false
                },
            }],
        }],
        default: []
    },
    submissions: {
        type: [{
            worker: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Worker'
            },
            items: [{
                item: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Item'
                },
                quantity: Number,
                price: Number,
                deduction_from_manager: Number,
                remarks_from_manager: String,
                underprocessing_value: Number,
                remarks_from_proprietor: String,
                date: Date,
                is_adhoc: {
                    type: Boolean,
                    default: false
                },
            }],
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
            underprocessing_value: Number,
            remarks_from_proprietor: String,
            is_adhoc: {
                type: Boolean,
                default: false
            },
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

managerSchema.set('strictPopulate', false);

const Manager = mongoose.model('Manager', managerSchema);
export default Manager;


