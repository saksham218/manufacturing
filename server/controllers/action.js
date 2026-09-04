import Action from '../models/action.js';
import mongoCache from '../cache/mongocache.js';
import { performUndoAction } from '../utils/audit.js';
import { populateHoldInfo } from '../utils/utils.js';
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

        const actions = await Action.find(filter)
            .select('action_id actor_id actor_type action_details.description action_details.event_date_label event_date record_date undone undo_date')
            .sort({ record_date: -1 })
            .lean();
        return res.status(200).json(actions);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const enrichFields = async (action_type, rawFields) => {
    const { item, worker, manager, old_manager, new_manager, hold_info, ...rest } = rawFields;
    const effectiveManager = old_manager ?? manager;

    const [itemDoc, workerDoc, managerDoc, newManagerDoc] = await Promise.all([
        item             ? mongoCache.get('item',    item.toString())             : null,
        worker           ? mongoCache.get('worker',  worker.toString())           : null,
        effectiveManager ? mongoCache.get('manager', effectiveManager.toString()) : null,
        new_manager      ? mongoCache.get('manager', new_manager.toString())      : null,
    ]);

    const result = { ...rest };
    if (itemDoc)       result.item                                      = { design_number: itemDoc.design_number, description: itemDoc.description };
    if (workerDoc)     result.worker                                    = { worker_id: workerDoc.worker_id, name: workerDoc.name };
    if (managerDoc)    result[old_manager ? 'old_manager' : 'manager'] = { manager_id: managerDoc.manager_id, name: managerDoc.name };
    if (newManagerDoc) result.new_manager                               = { manager_id: newManagerDoc.manager_id, name: newManagerDoc.name };
    if (hold_info)     result.hold_info                                 = await populateHoldInfo({ ...hold_info });

    return result;
};

export const getActionDetail = async (req, res) => {
    const { action_id } = req.params;
    const actor_type = req.manager?.manager_id ? "manager" : "proprietor";
    const actor_id = req.manager?.manager_id ?? req.proprietor.proprietor_id;

    try {
        const action = await Action.findOne({ action_id, actor_id, actor_type }).lean();
        if (!action) return res.status(404).json({ message: "Action not found" });

        const fields = await enrichFields(action.action_type, action.action_details.fields);

        return res.status(200).json({
            action_id:        action.action_id,
            action_type:      action.action_type,
            actor_id:         action.actor_id,
            actor_type:       action.actor_type,
            description:      action.action_details.description,
            event_date_label: action.action_details.event_date_label,
            fields,
            event_date:       action.event_date,
            record_date:      action.record_date,
            undone:           action.undone,
            undo_date:        action.undo_date,
        });
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
