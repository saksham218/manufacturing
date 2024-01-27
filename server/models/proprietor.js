import mongoose from "mongoose";


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
});

const Proprietor = mongoose.model("Proprietor", proprietorSchema);

export default Proprietor;