import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    design_number: String,
    description: String,
    price: Number,
    createdOn: Date,
});

const Item = mongoose.model("Item", itemSchema);
export default Item;