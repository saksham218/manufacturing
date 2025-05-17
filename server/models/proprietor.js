import mongoose from "mongoose";
import Hold_Info from "./hold_info.js";


const proprietorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    // managers: {
    //     type: [{
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'Manager'
    //     }],
    //     default: []
    // },
    // items: {
    //     type: [{
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'Item'
    //     }],
    //     default: []
    // },
    proprietor_id: { type: String, required: true },
    password: { type: String, required: true },
    on_hold: {
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
            hold_date: Date,
            put_on_hold_by: {
                type: String,
                enum: ['manager', 'proprietor']
            },
            holding_remarks: String,
            is_adhoc: {
                type: Boolean,
                default: false
            },
            worker: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Worker'
            },
            manager: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Manager'
            },
            hold_info: Hold_Info
        }],
        default: []
    }
});

const Proprietor = mongoose.model("Proprietor", proprietorSchema);

export default Proprietor;