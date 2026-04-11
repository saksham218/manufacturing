import mongoose from 'mongoose'
import Hold_Info from './hold_info.js';

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
            issue_date: Date,
            price: Number,
            hold_info: Hold_Info,
            record_date: Date
        }],
        default: []
    },
    accepted_history: {
        type: [{
            worker: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Worker'
            },
            accept_date: Date,
            submit_to_proprietor_date: Date,
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
            is_adhoc: {
                type: Boolean,
                default: false
            },
            hold_info: Hold_Info,
            was_to_hold: Boolean,
            record_date: Date
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
            hold_info: Hold_Info,
            price: Number,
            event_date: Date,
            record_date: Date
        }],
        default: []
    },
    due_forward_log: {
        type: [{
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },
            quantity: Number,
            underprocessing_value: Number,
            // thread_raw_material: String,
            remarks_from_proprietor: String,
            hold_info: Hold_Info,
            price: Number,
            event_date: Date,
            record_date: Date
        }],
        default: []
    },
    due_backward: {
        type: [{
            worker: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Worker'
            },
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
            to_hold: {
                type: Boolean,
                default: false
            },
            hold_info: Hold_Info,
            event_date: Date,
            record_date: Date
        }],
        default: []
    },
    due_backward_log: {
        type: [{
            worker: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Worker'
            },
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
            to_hold: {
                type: Boolean,
                default: false
            },
            hold_info: Hold_Info,
            event_date: Date,
            record_date: Date
        }],
        default: []
    },
    submissions: {
        type: [{
            worker: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Worker'
            },
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
            hold_info: Hold_Info,
            to_hold: {
                type: Boolean,
                default: false
            },
            event_date: Date,
            record_date: Date
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
            hold_info: Hold_Info,
            price: Number,
            event_date: Date,
            record_date: Date
        }],
        default: []
    },
    total_due_log: {
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
            hold_info: Hold_Info,
            price: Number,
            event_date: Date,
            record_date: Date
        }],
        default: []
    },
    payment_history: {
        type: [{
            amount: Number,
            payment_date: Date,
            record_date: Date,
            remarks: String
        }],
        default: []
    },
    expense_requests: {
        type: [{
            amount: Number,
            request_date: Date,
            record_date: Date,
            remarks: String
        }],
        default: []
    },
    due_amount: {
        type: Number,
        default: 0
    },
    forfeited_history: {
        type: [{
            submit_to_proprietor_date: Date,
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },
            quantity: Number,
            price: Number,
            penalty: Number,
            deduction_from_manager: Number,
            remarks_from_manager: String,
            underprocessing_value: Number,
            remarks_from_proprietor: String,
            final_remarks_from_proprietor: String,
            is_adhoc: {
                type: Boolean,
                default: false
            },
            hold_info: Hold_Info,
            forfeiture_date: Date,
            worker: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Worker'
            },
            was_to_hold: Boolean,
            record_date: Date
        }],
        default: []
    },
    on_hold_history: {
        type: [{
            submit_to_proprietor_date: Date,
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },
            quantity: Number,
            price: Number,
            partial_payment: Number,
            underprocessing_value: Number,
            remarks_from_proprietor: String,
            deduction_from_manager: Number,
            remarks_from_manager: String,
            is_adhoc: {
                type: Boolean,
                default: false
            },
            put_on_hold_by: {
                type: String,
                enum: ['manager', 'proprietor']
            },
            holding_remarks: String,
            hold_info: Hold_Info,
            hold_date: Date,
            worker: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Worker'
            },
            was_to_hold: Boolean,
            record_date: Date
        }],
        default: []
    },
    submit_history: {
        type: [{
            submit_date: Date,
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },
            quantity: Number,
            price: Number,
            underprocessing_value: Number,
            remarks_from_proprietor: String,
            deduction_from_manager: Number,
            remarks_from_manager: String,
            is_adhoc: {
                type: Boolean,
                default: false
            },
            hold_info: Hold_Info,
            worker: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Worker'
            },
            to_hold: Boolean,
            record_date: Date
        }],
        default: []
    }

});

const Manager = mongoose.model('Manager', managerSchema);
export default Manager;


