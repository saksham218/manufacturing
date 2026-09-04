import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const actionSchema = new mongoose.Schema({
    action_id: {
        type: String,
        unique: true,
        required: true,
        default: () => randomUUID()
    },
    action_type: { type: String, required: true },
    actor_type: { type: String, enum: ["manager", "proprietor"], required: true },
    actor_id: { type: String, required: true },

    action_details: {
        description: String,
        event_date_label: String,
        fields: Object
    },

    event_date: Date,
    record_date: Date,

    transient_additions: [{
        entity_type: { type: String, enum: ["manager", "worker", "proprietor"] },
        entity_id: String,
        transient_list: String,
        quantity: Number
    }],

    transient_removals: [{
        entity_type: { type: String, enum: ["manager", "worker", "proprietor"] },
        entity_id: String,
        transient_list: String,
        quantity: Number
    }],

    history_additions: [{
        entity_type: { type: String, enum: ["manager", "worker"] },
        entity_id: String,
        history: String,
        subdoc_id: mongoose.Schema.Types.ObjectId
    }],

    other_changes: [{
        entity_type: { type: String, enum: ["manager", "worker"] },
        entity_id: String,
        field: String,
        delta: Number
    }],

    undone: { type: Boolean, default: false },
    undo_date: Date
});

const Action = mongoose.model('Action', actionSchema);
export default Action;
