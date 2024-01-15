import mongoose from "mongoose";


const proprietorSchema = new mongoose.Schema({
    name: String,
    managers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager'
    }],
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }],
    id: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});

const Proprietor = mongoose.model("Proprietor", proprietorSchema);

export default Proprietor;