import mongoose from 'mongoose';

const Hold_Info = new mongoose.Schema({
    is_hold: { type: Boolean, default: false },
    price: Number,
    partial_payment: Number,
    underprocessing_value: Number,
    remarks_from_proprietor: String,
    deduction_from_manager: Number,
    remarks_from_manager: String,
    is_adhoc: Boolean,
    hold_date: Date,
    put_on_hold_by: {
        type: String,
        enum: ['manager', 'proprietor']
    },
    holding_remarks: String,
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker'
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager'
    },
}, { _id: false });

Hold_Info.add({
    prev_hold_info: Hold_Info
})

export default Hold_Info;