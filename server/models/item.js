import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    design_number: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    underprocessing_value: { type: Number, required: true },
    proprietor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proprietor',
        required: true
    },
    createdOn: { type: Date, required: true, default: Date.now },
});

const Item = mongoose.model("Item", itemSchema);
export default Item;