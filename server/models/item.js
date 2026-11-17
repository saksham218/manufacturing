import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    design_number: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    underprocessing_value: { type: Number, required: true },
    proprietor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proprietor',
        required: true
    },
    created_date: { type: Date, required: true, default: Date.now },
    last_updated_date: { type: Date },
});

const Item = mongoose.model("Item", itemSchema);
export default Item;