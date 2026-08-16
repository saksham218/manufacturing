import Action from '../models/action.js';
import { performUndoAction } from '../utils/audit.js';
import { BusinessError } from '../utils/errors.js';

export const getActions = async (req, res) => {
    const { undone, from_date, to_date, action_type } = req.body;

    const actor_type = req.manager?.manager_id ? "manager" : "proprietor";
    const actor_id = req.manager?.manager_id ?? req.proprietor.proprietor_id;

    try {
        const filter = { actor_id, actor_type };

        if (action_type) filter.action_type = action_type;
        if (undone !== undefined) filter.undone = undone;

        if (from_date || to_date) {
            filter.event_date = {};
            if (from_date) filter.event_date.$gte = new Date(from_date);
            if (to_date) filter.event_date.$lte = new Date(to_date);
        }

        const actions = await Action.find(filter).sort({ record_date: -1 });
        return res.status(200).json(actions);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const undoAction = async (req, res) => {
    const { action_id } = req.params;
    const caller_type = req.manager?.manager_id ? "manager" : "proprietor";
    const caller_id = req.manager?.manager_id ?? req.proprietor.proprietor_id;

    try {
        const action = await performUndoAction(action_id, caller_id, caller_type);
        return res.status(200).json(action);
    } catch (error) {
        if (error instanceof BusinessError) return res.status(error.status).json({ message: error.message });
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
