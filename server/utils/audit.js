import Action from '../models/action.js';
import Manager from '../models/manager.js';
import Worker from '../models/worker.js';
import Proprietor from '../models/proprietor.js';
import { addToTransient, validateAndRemoveFromTransient } from './utils.js';
import { runInTransaction } from './transaction.js';
import { BusinessError } from './errors.js';

// Reconstructs the push_to_list_log descriptor from stored fields.
// Fully synchronous — ObjectIds are stored directly in fields at record time.
export const buildDescriptor = (action_type, transient_list, fields) => {
    switch (action_type) {

        case "issueToManager": {
            const base = {
                item: fields.item_id,
                price: null,
                underprocessing_value: fields.underprocessing_value,
                remarks_from_proprietor: fields.remarks,
                hold_info: null,
            };
            if (transient_list === "total_due") return { ...base, is_adhoc: false };
            if (transient_list === "due_forward") return base;
            break;
        }

        case "issueToWorker": {
            if (transient_list === "due_items") return {
                item: fields.item_id,
                price: fields.price,
                underprocessing_value: fields.underprocessing_value,
                remarks_from_proprietor: fields.remarks,
                hold_info: fields.hold_info,
            };
            if (transient_list === "due_forward") return {
                item: fields.item_id,
                price: fields.is_price_from_df ? Number(fields.price) : null,
                underprocessing_value: Number(fields.underprocessing_value),
                remarks_from_proprietor: fields.remarks,
                hold_info: fields.hold_info,
            };
            break;
        }

        case "submitFromWorker": {
            if (transient_list === "due_backward") return {
                worker: fields.worker_object_id,
                item: fields.item_id,
                price: fields.price,
                deduction_from_manager: Number(fields.deduction),
                underprocessing_value: fields.underprocessing_value,
                remarks_from_manager: fields.remarks,
                remarks_from_proprietor: fields.remarks_from_proprietor,
                is_adhoc: !!fields.is_adhoc,
                to_hold: !!fields.to_hold,
                hold_info: fields.hold_info,
            };
            if (transient_list === "total_due") return {
                item: fields.item_id,
                price: Number(fields.price),
                underprocessing_value: Number(fields.underprocessing_value),
                remarks_from_proprietor: fields.remarks_from_proprietor,
                is_adhoc: true,
                hold_info: fields.hold_info,
            };
            if (transient_list === "held_by_manager") return {
                item: fields.item_id,
                price: Number(fields.price),
                underprocessing_value: Number(fields.underprocessing_value),
                remarks_from_manager: fields.remarks,
                remarks_from_proprietor: fields.remarks_from_proprietor,
                is_adhoc: !!fields.is_adhoc,
                hold_info: fields.hold_info,
            };
            if (transient_list === "due_items") return {
                item: fields.item_id,
                price: fields.price,
                underprocessing_value: fields.underprocessing_value,
                remarks_from_proprietor: fields.remarks_from_proprietor,
                hold_info: fields.hold_info,
            };
            break;
        }

        case "submitToProprietor": {
            const base = {
                worker: fields.worker_object_id,
                item: fields.item_id,
                price: Number(fields.price),
                deduction_from_manager: Number(fields.deduction_from_manager),
                underprocessing_value: Number(fields.underprocessing_value),
                remarks_from_manager: fields.remarks_from_manager,
                remarks_from_proprietor: fields.remarks_from_proprietor,
                is_adhoc: fields.is_adhoc,
                to_hold: fields.to_hold,
                hold_info: fields.hold_info,
            };
            if (transient_list === "submissions") return {
                ...base,
                submit_to_proprietor_date: new Date(fields.submit_date),
            };
            if (transient_list === "due_backward") return base;
            break;
        }

        case "acceptFromManager": {
            const hold_info = fields.hold_info;
            if (transient_list === "total_due") return {
                item: fields.item_id,
                price: (fields.is_adhoc || (hold_info && hold_info.is_hold)) ? Number(fields.price) : null,
                underprocessing_value: Number(fields.underprocessing_value),
                remarks_from_proprietor: fields.remarks_from_proprietor,
                is_adhoc: fields.is_adhoc,
                hold_info,
            };
            if (transient_list === "submissions") return {
                worker: fields.worker_object_id,
                item: fields.item_id,
                submit_to_proprietor_date: new Date(fields.submit_to_proprietor_date),
                price: Number(fields.price),
                deduction_from_manager: Number(fields.deduction_from_manager),
                underprocessing_value: Number(fields.underprocessing_value),
                remarks_from_manager: fields.remarks_from_manager,
                remarks_from_proprietor: fields.remarks_from_proprietor,
                is_adhoc: fields.is_adhoc,
                to_hold: fields.to_hold,
                hold_info,
            };
            if (transient_list === "held_by_manager") return {
                item: fields.item_id,
                price: Number(fields.price),
                underprocessing_value: Number(fields.underprocessing_value),
                remarks_from_manager: fields.remarks_from_manager,
                remarks_from_proprietor: fields.remarks_from_proprietor,
                is_adhoc: fields.is_adhoc,
                hold_info,
            };
            if (transient_list === "on_hold") {
                const put_on_hold_by = fields.to_hold ? "manager" : "proprietor";
                return {
                    item: fields.item_id,
                    price: Number(fields.price),
                    partial_payment: Number(fields.partial_payment),
                    underprocessing_value: Number(fields.underprocessing_value),
                    remarks_from_proprietor: fields.remarks_from_proprietor,
                    deduction_from_manager: Number(fields.deduction_from_manager),
                    remarks_from_manager: fields.remarks_from_manager,
                    put_on_hold_by,
                    holding_remarks: fields.final_remarks,
                    is_adhoc: fields.is_adhoc,
                    worker: fields.worker_object_id,
                    manager: fields.manager_object_id,
                    hold_date: new Date(fields.action_date),
                    submit_to_proprietor_date: new Date(fields.submit_to_proprietor_date),
                    hold_info,
                };
            }
            break;
        }

        case "issueOnHoldItemsToManager": {
            const hold_info = fields.hold_info;
            const new_hold_info = {
                is_hold: true,
                price: Number(fields.price),
                partial_payment: Number(fields.partial_payment),
                underprocessing_value: Number(fields.underprocessing_value),
                remarks_from_proprietor: fields.remarks_from_proprietor,
                deduction_from_manager: Number(fields.deduction_from_manager),
                remarks_from_manager: fields.remarks_from_manager,
                is_adhoc: fields.is_adhoc,
                hold_date: new Date(fields.hold_date),
                holding_remarks: fields.holding_remarks,
                put_on_hold_by: fields.put_on_hold_by,
                manager: fields.manager_object_id,
                worker: fields.worker_object_id,
                submit_to_proprietor_date: new Date(fields.submit_to_proprietor_date),
                prev_hold_info: hold_info,
            };

            if (transient_list === "due_forward") return {
                item: fields.item_id,
                price: Number(fields.new_price),
                underprocessing_value: Number(fields.new_underprocessing_value),
                remarks_from_proprietor: fields.new_remarks_from_proprietor,
                hold_info: new_hold_info,
            };
            if (transient_list === "total_due") return {
                item: fields.item_id,
                price: Number(fields.new_price),
                underprocessing_value: Number(fields.new_underprocessing_value),
                remarks_from_proprietor: fields.new_remarks_from_proprietor,
                is_adhoc: false,
                hold_info: new_hold_info,
            };
            if (transient_list === "on_hold") return {
                item: fields.item_id,
                price: Number(fields.price),
                partial_payment: Number(fields.partial_payment),
                underprocessing_value: Number(fields.underprocessing_value),
                remarks_from_proprietor: fields.remarks_from_proprietor,
                deduction_from_manager: Number(fields.deduction_from_manager),
                remarks_from_manager: fields.remarks_from_manager,
                put_on_hold_by: fields.put_on_hold_by,
                holding_remarks: fields.holding_remarks,
                is_adhoc: fields.is_adhoc,
                worker: fields.worker_object_id,
                manager: fields.manager_object_id,
                hold_date: new Date(fields.hold_date),
                submit_to_proprietor_date: new Date(fields.submit_to_proprietor_date),
                hold_info,
            };
            break;
        }
    }
    throw new Error(`Unknown action_type/transient_list combination: ${action_type}/${transient_list}`);
};

// Incremental audit builder — create once, record operations as they happen, then save.
export const createAudit = ({ action_type, actor_type, actor_id, description, fields, event_date, record_date }) => {
    const transient_additions = [];
    const transient_removals = [];
    const history_additions = [];
    const other_changes = [];

    return {
        addTransientAddition({ entity_type, entity_id, transient_list, quantity }) {
            transient_additions.push({ entity_type, entity_id, transient_list, quantity });
        },
        addTransientRemoval({ entity_type, entity_id, transient_list, quantity }) {
            transient_removals.push({ entity_type, entity_id, transient_list, quantity });
        },
        // Call immediately after entity[history].push(...) so the last element's _id is captured.
        recordHistoryAddition({ entity_type, entity_id, history, entity }) {
            const subdoc_id = entity[history][entity[history].length - 1]._id;
            history_additions.push({ entity_type, entity_id, history, subdoc_id });
        },
        recordOtherChange({ entity_type, entity_id, field, delta }) {
            other_changes.push({ entity_type, entity_id, field, delta });
        },
        async save(session) {
            const action = new Action({
                action_type, actor_type, actor_id,
                action_details: { description, fields },
                event_date,
                record_date,
                transient_additions, transient_removals,
                history_additions, other_changes,
                undone: false,
            });
            if (session) {
                await action.save({ session });
            } else {
                await action.save();
            }
            return action;
        },
    };
};

export const performUndoAction = async (action_id, caller_id, caller_type) => {
    return runInTransaction(async (session) => {
        const action = await Action.findOne({ action_id }).session(session);
        if (!action) throw new BusinessError(400, "Action not found");
        if (action.undone) throw new BusinessError(400, "Action already undone");
        if (action.actor_id !== caller_id || action.actor_type !== caller_type)
            throw new BusinessError(403, "Access Denied");

        const entityCache = new Map();   // entity_type → document

        const fetchByTypeAndId = async (entity_type, entity_id) => {
            if (entity_type === "manager") return Manager.findOne({ manager_id: entity_id }).session(session);
            if (entity_type === "worker") return Worker.findOne({ worker_id: entity_id }).session(session);
            if (entity_type === "proprietor") return Proprietor.findOne({ proprietor_id: entity_id }).session(session);
            throw new Error(`Unknown entity_type: ${entity_type}`);
        };

        const getEntity = async (entity_type, entity_id) => {
            if (entityCache.has(entity_type)) return entityCache.get(entity_type);
            const doc = await fetchByTypeAndId(entity_type, entity_id);
            entityCache.set(entity_type, doc);
            return doc;
        };

        const dirtySet = new Set();
        const markDirty = (entity_type) => dirtySet.add(entity_type);

        // Pre-fetch all entities referenced in the action document
        const allEntries = [
            ...action.transient_additions,
            ...action.transient_removals,
            ...action.history_additions,
            ...action.other_changes,
        ];
        const seen = new Set();
        for (const entry of allEntries) {
            if (!seen.has(entry.entity_type)) {
                seen.add(entry.entity_type);
                await getEntity(entry.entity_type, entry.entity_id);
            }
        }

        const now = new Date();
        const fields = action.action_details.fields;
        const action_type = action.action_type;

        // Validate all transient additions before applying any mutations
        for (const addition of action.transient_additions) {
            const { entity_type, entity_id, transient_list, quantity } = addition;
            const entity = await getEntity(entity_type, entity_id);
            const descriptor = buildDescriptor(action_type, transient_list, fields);

            const success = validateAndRemoveFromTransient(
                entity, entity_type, entity_id, transient_list,
                descriptor, quantity, action.event_date, now
            );
            if (!success) throw new BusinessError(400, `Cannot undo: quantity no longer available in ${transient_list} for ${entity_type}:${entity_id}`);
            markDirty(entity_type);
        }

        // Restore all transient removals
        for (const removal of action.transient_removals) {
            const { entity_type, entity_id, transient_list, quantity } = removal;
            const entity = await getEntity(entity_type, entity_id);
            const descriptor = buildDescriptor(action_type, transient_list, fields);

            addToTransient(
                entity, entity_type, entity_id, transient_list,
                descriptor, quantity, action.event_date, now
            );
            markDirty(entity_type);
        }

        // Mark history subdocs as undone
        for (const histAddition of action.history_additions) {
            const { entity_type, entity_id, history, subdoc_id } = histAddition;
            const entity = await getEntity(entity_type, entity_id);
            const subdoc = entity[history].id(subdoc_id);
            if (!subdoc) throw new BusinessError(400, `History subdoc ${subdoc_id} not found in ${entity_type}.${history}`);
            subdoc.undone = true;
            subdoc.undo_date = now;
            markDirty(entity_type);
        }

        // Reverse scalar field deltas
        for (const change of action.other_changes) {
            const { entity_type, entity_id, field, delta } = change;
            const entity = await getEntity(entity_type, entity_id);
            entity[field] -= delta;
            markDirty(entity_type);
        }

        // Save all dirty entities
        await Promise.all([...dirtySet].map(type => entityCache.get(type).save({ session })));

        // Mark action as undone
        action.undone = true;
        action.undo_date = now;
        await action.save({ session });

        return action;
    });
};
