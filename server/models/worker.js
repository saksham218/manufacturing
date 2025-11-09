import mongoose from 'mongoose';
import Hold_Info from './hold_info.js';

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
            underprocessing_value: Number,
            remarks_from_proprietor: String,
            hold_info: Hold_Info
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
            underprocessing_value: Number,
            // thread_raw_material: String,
            remarks_from_proprietor: String,
            date: Date,
            hold_info: Hold_Info
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
            deduction_from_manager: Number,
            remarks_from_manager: String,
            underprocessing_value: Number,
            remarks_from_proprietor: String,
            date: Date,
            is_adhoc: {
                type: Boolean,
                default: false
            },
            hold_info: Hold_Info
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
    deductions_from_proprietor: {
        type: [{
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },
            price: Number,
            quantity: Number,
            deduction_from_proprietor: Number,
            final_remarks_from_proprietor: String,
            deduction_from_manager: Number,
            submit_to_proprietor_date: Date,
            deduction_date: Date,
            remarks_from_manager: String,
            remarks_from_proprietor: String,
            underprocessing_value: Number,
            hold_info: Hold_Info
        }],
        default: []
    },
    forfeited_history: {
        type: [{
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
            submit_to_proprietor_date: Date,
            forfeiture_date: Date,
            is_adhoc: {
                type: Boolean,
                default: false
            },
            hold_info: Hold_Info
        }],
        default: []
    },
    on_hold_history: {
        type: [{
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
            submit_to_proprietor_date: Date,
            hold_date: Date,
            holding_remarks: String,
            put_on_hold_by: {
                type: String,
                enum: ['manager', 'proprietor']
            },
            is_adhoc: {
                type: Boolean,
                default: false
            },
            hold_info: Hold_Info
        }],
        default: []
    },
    held_by_manager: {
        type: [{
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },
            quantity: Number,
            price: Number,
            underprocessing_value: Number,
            remarks_from_proprietor: String,
            remarks_from_manager: String,
            is_adhoc: {
                type: Boolean,
                default: false
            },
            hold_info: Hold_Info
        }],
        default: []
    }

});

const Worker = mongoose.model('Worker', workerSchema);
export default Worker;