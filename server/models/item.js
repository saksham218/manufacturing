import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    design_number: String,
    description: String,
    price: Number,
    proprietor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proprietor'
    },
    createdOn: Date,
});

const Item = mongoose.model("Item", itemSchema);
export default Item;