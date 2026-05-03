import _ from "lodash";

import mongoCache from "../cache/mongocache.js";

const depopulateObject = (obj) => {
    if (obj && obj._id) {
        return obj._id;
    }
    return obj;
}

const populateKeys = ['worker', 'manager'];

export const isSameDay = (d1, d2) => {
    if (!(d1 instanceof Date)) d1 = new Date(d1);
    if (!(d2 instanceof Date)) d2 = new Date(d2);
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
}

export const isDayLessThanOrEqualTo = (d1, d2) => {
    // console.log("isDayLessThanOrEqualTo - Original d1:", d1);
    // console.log("isDayLessThanOrEqualTo - Original d2:", d2);
    if (!(d1 instanceof Date)) d1 = new Date(d1);
    if (!(d2 instanceof Date)) d2 = new Date(d2);
    // console.log("isDayLessThanOrEqualTo - Converted d1:", d1);
    // console.log("isDayLessThanOrEqualTo - Converted d2:", d2);

    return d1.getFullYear() < d2.getFullYear() || (d1.getFullYear() === d2.getFullYear() && d1.getMonth() < d2.getMonth()) || (d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() <= d2.getDate());
}

export const isDayGreaterThanOrEqualTo = (d1, d2) => {
    // console.log("isDayGreaterThanOrEqualTo - Original d1:", d1);
    // console.log("isDayGreaterThanOrEqualTo - Original d2:", d2);
    if (!(d1 instanceof Date)) d1 = new Date(d1);
    if (!(d2 instanceof Date)) d2 = new Date(d2);
    // console.log("isDayGreaterThanOrEqualTo - Converted d1:", d1);
    // console.log("isDayGreaterThanOrEqualTo - Converted d2:", d2);

    return d1.getFullYear() > d2.getFullYear() || (d1.getFullYear() === d2.getFullYear() && d1.getMonth() > d2.getMonth()) || (d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() >= d2.getDate());
}

export const hashObject = (obj, keys) => {
    const serializeHoldInfo = (hi) => {
        if (!hi || !hi.is_hold) return 'no_hold';
        const w = hi.worker ? (hi.worker._id || hi.worker).toString() : 'null';
        const m = hi.manager ? (hi.manager._id || hi.manager).toString() : 'null';
        const d = hi.hold_date
            ? (() => { const dt = new Date(hi.hold_date); return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`; })()
            : 'null';
        return [
            hi.is_hold, hi.price, hi.partial_payment, hi.underprocessing_value,
            hi.remarks_from_proprietor, hi.deduction_from_manager, hi.remarks_from_manager,
            hi.is_adhoc, hi.put_on_hold_by, hi.holding_remarks, d, w, m,
            serializeHoldInfo(hi.prev_hold_info)
        ].join('|');
    };

    const serializeValue = (val) => {
        if (val === null || val === undefined) return 'null';
        if (typeof val !== 'object') return String(val);
        if (val instanceof Date) return `${val.getFullYear()}-${val.getMonth()}-${val.getDate()}`;
        if (val._id !== undefined) return val._id.toString(); // populated mongoose doc
        if (val.constructor && val.constructor.name === 'ObjectId') return val.toString(); // raw ObjectId
        return serializeHoldInfo(val);
    };

    return [...keys].sort().map(k => `${k}:${serializeValue(obj[k])}`).join(';');
}

export const isSameHoldInfo = (hold_info1, hold_info2) => {
    // console.log("(from array) hold_info1: ", hold_info1);
    // console.log("hold_info2: ", hold_info2);
    // console.log("hi");

    if (!hold_info1 && !hold_info2) return true;
    if ((hold_info1 && hold_info1.is_hold === false && !hold_info2) || (hold_info2 && hold_info2.is_hold === false && !hold_info1)) return true;
    if (!hold_info1 || !hold_info2) return false;
    if (hold_info1.is_hold === false && hold_info2.is_hold === false) return true;
    const result = hold_info1.is_hold === hold_info2.is_hold
        && Number(hold_info1.price) === Number(hold_info2.price)
        && Number(hold_info1.partial_payment) === Number(hold_info2.partial_payment)
        && Number(hold_info1.underprocessing_value) === Number(hold_info2.underprocessing_value)
        && hold_info1.remarks_from_proprietor === hold_info2.remarks_from_proprietor
        && Number(hold_info1.deduction_from_manager) === Number(hold_info2.deduction_from_manager)
        && hold_info1.remarks_from_manager === hold_info2.remarks_from_manager
        && hold_info1.is_adhoc === hold_info2.is_adhoc
        && isSameDay(hold_info1.hold_date, hold_info2.hold_date)
        && hold_info1.put_on_hold_by === hold_info2.put_on_hold_by
        && hold_info1.holding_remarks === hold_info2.holding_remarks
        && hold_info1.worker.equals(hold_info2.worker)
        && hold_info1.manager.equals(hold_info2.manager)
        && isSameHoldInfo(hold_info1.prev_hold_info, hold_info2.prev_hold_info);
    console.log("result: ", result);
    return result;
}

export const managerPopulatePaths = {
    issue_history: {},
    accepted_history: {},
    due_forward: {},
    due_backward: {},
    due_backward_log: {},
    submissions: {},
    total_due: {},
    forfeited_history: {},
    on_hold_history: {},
    submit_history: {}
}

export const workerPopulatePaths = {
    due_items: {},
    issue_history: {},
    submit_history: {},
    accepted_history: {},
    forfeited_history: {},
    held_by_manager: {},
    on_hold_history: {}
}

export const proprietorPopulatePaths = {
    on_hold: {}
}

export const prepare = async (paths, obj, pOrdp) => {

    for (const path in paths) {
        console.log(path)
        if (obj[path]) {
            obj[path] = await Promise.all(_.map(obj[path], async data => {
                if (paths[path].subpaths) {
                    const response = await prepare(paths[path].subpaths, data, pOrdp)
                    return response;
                }
                else {
                    if ('hold_info' in data) {
                        const operation = pOrdp ? populateHoldInfo : depopulateHoldInfo
                        data['hold_info'] = await operation(data['hold_info'])
                    }

                    return data
                }
            }))
        }

    }

    return obj;

}


export const populateHoldInfo = async (hold_info) => {
    // console.log("populate hold_info: ", hold_info);
    if (!hold_info || !hold_info.is_hold) {
        return hold_info;
    }

    for (const key of populateKeys) {
        // console.log("populating: ", key)

        hold_info[key] = await mongoCache.get(key, hold_info[key].toString());
        console.log("populated " + key + ": ", hold_info[key])
    }

    if ('prev_hold_info' in hold_info) {
        hold_info['prev_hold_info'] = await populateHoldInfo(hold_info.prev_hold_info)
    }

    // console.log("populated: ", hold_info)
    return hold_info;
}

export const depopulateHoldInfo = async (hold_info) => {
    // console.log("depopulate hold_info: ", hold_info);
    if (!hold_info || !hold_info.is_hold) {
        return hold_info;
    }

    for (const key of populateKeys) {
        // console.log("depopulating: ", key)
        if (key in hold_info) {
            console.log("hold_info[key]: ", hold_info[key])
            const cacheResponse = await mongoCache.get(key, hold_info[key]['_id']);
            if (cacheResponse) {
                hold_info[key] = depopulateObject(cacheResponse);
                // console.log(typeof hold_info[key])
            }
        }
    }

    if ('prev_hold_info' in hold_info) {
        hold_info['prev_hold_info'] = await depopulateHoldInfo(hold_info.prev_hold_info)
    }

    return hold_info;
}

// adds to transient_list and transient_log (if provided) (not to any history)
export const addToTransient = (transient_list, transient_log, check_equality, push_to_list_log, quantity, event_date, record_date) => {

    const list_index = transient_list.findIndex(check_equality);
    if (list_index === -1) {
        transient_list.push({ ...push_to_list_log, quantity: Number(quantity), record_date: record_date, event_date: event_date });
    } else {
        transient_list[list_index].quantity += Number(quantity);
        transient_list[list_index].record_date = record_date;
        if (isDayGreaterThanOrEqualTo(event_date, transient_list[list_index].event_date)) {
            transient_list[list_index].event_date = event_date;
        }

    }

    if (transient_log) {

        let log_index = -1;
        let shouldInsert = true;
        let i = 0;
        let prevQuantity = 0;

        for (i = 0; i < transient_log.length; i++) {
            const log = transient_log[i];

            if (check_equality(log) && !isDayGreaterThanOrEqualTo(log.event_date, event_date)) {
                prevQuantity = log.quantity;
            }

            if (check_equality(log) && isSameDay(log.event_date, event_date)) {
                log.quantity += Number(quantity);
                log.record_date = record_date;
                shouldInsert = false;
                break;
            }
            if (!isDayLessThanOrEqualTo(log.event_date, event_date)) {
                break;
            }
        }

        log_index = i;

        if (shouldInsert) {
            transient_log.splice(log_index, 0, { ...push_to_list_log, quantity: prevQuantity + Number(quantity), record_date: record_date, event_date: event_date });
        }

        for (let i = log_index + 1; i < transient_log.length; i++) {
            const log = transient_log[i];
            if (check_equality(log)) {
                log.quantity += Number(quantity);
                log.record_date = record_date;
            }
        }
    }
}

// calculates using transient_list and transient_log or addition_history/removal_history
export const getRemovalQuantitiesFromTransient = (transient_list, transient_log, addition_history, addition_event_date_key, removal_history, removal_event_date_key, keys, event_date) => {

    if (!transient_log && !(addition_history && addition_event_date_key && removal_history && removal_event_date_key)) {
        throw new Error("Invalid state: neither transient_log nor addition_history/removal_history provided");
    }

    const result = [];
    const transient_list_map = new Map();
    for (let i = 0; i < transient_list.length; i++) {
        const item = transient_list[i];
        if (isDayGreaterThanOrEqualTo(event_date, item.event_date)) {
            const res = {}
            for (let key of keys) {
                res[key] = item[key];
            }
            res.quantity = item.quantity;
            result.push(res);
        } else {
            const key = hashObject(item, keys);
            transient_list_map.set(key, transient_log ? { ...item, event_on_or_before_found: false, quantity: Infinity } : { ...item, current_quantity: 0, quantity: Infinity, prev_history_event_date: null });
        }

    }

    if (transient_log) {
        for (let i = transient_log.length - 1; i >= 0; i--) {
            const log = transient_log[i];
            const logHash = hashObject(log, keys);
            if (transient_list_map.has(logHash)) {
                if (!isDayLessThanOrEqualTo(log.event_date, event_date)) {
                    transient_list_map.get(logHash).quantity = Math.min(transient_list_map.get(logHash).quantity, log.quantity);
                } else {
                    if (!transient_list_map.get(logHash).event_on_or_before_found) {
                        transient_list_map.get(logHash).event_on_or_before_found = true;
                        transient_list_map.get(logHash).quantity = Math.min(transient_list_map.get(logHash).quantity, log.quantity);
                    }
                }
            }
        }
    } else {
        const sorted_additions = [...addition_history].sort((a, b) => new Date(a[addition_event_date_key]) - new Date(b[addition_event_date_key]));
        const sorted_removals = [...removal_history].sort((a, b) => new Date(a[removal_event_date_key]) - new Date(b[removal_event_date_key]));
        let addition_index = 0;
        let removal_index = 0;
        while (addition_index < sorted_additions.length || removal_index < sorted_removals.length) {
            let event;
            let mode;
            let history_event_date;
            if (addition_index < sorted_additions.length && (removal_index >= sorted_removals.length || isDayLessThanOrEqualTo(sorted_additions[addition_index][addition_event_date_key], sorted_removals[removal_index][removal_event_date_key]))) {
                event = sorted_additions[addition_index];
                mode = "addition";
                history_event_date = sorted_additions[addition_index][addition_event_date_key];
                addition_index++;
            } else {
                event = sorted_removals[removal_index];
                mode = "removal";
                history_event_date = sorted_removals[removal_index][removal_event_date_key];
                removal_index++;
            }
            const eventHash = hashObject(event, keys);
            if (transient_list_map.has(eventHash)) {

                if (!isDayLessThanOrEqualTo(history_event_date, transient_list_map.get(eventHash).prev_history_event_date) && !isDayLessThanOrEqualTo(history_event_date, event_date)) {
                    transient_list_map.get(eventHash).quantity = Math.min(transient_list_map.get(eventHash).quantity, transient_list_map.get(eventHash).current_quantity);
                }

                if (mode === "addition") {
                    transient_list_map.get(eventHash).current_quantity += event.quantity;
                } else {
                    transient_list_map.get(eventHash).current_quantity -= event.quantity;
                }
                transient_list_map.get(eventHash).prev_history_event_date = history_event_date;
            }
        }
        transient_list_map.forEach((value) => {
            if (!isDayLessThanOrEqualTo(value.prev_history_event_date, event_date)) {
                value.quantity = Math.min(value.quantity, value.current_quantity);
            }
        });
    }

    for (let [, value] of transient_list_map) {
        if ((value.event_on_or_before_found || !transient_log) && value.quantity > 0) {
            const res = {}
            for (let key of keys) {
                res[key] = value[key];
            }
            res.quantity = value.quantity;
            result.push(res);
        }
    }
    return result;
}

// validates and removes from transient_list and transient_log (if provided) (not from any history)
export const validateAndRemoveFromTransient = (transient_list, transient_log, addition_history, addition_event_date_key, removal_history, removal_event_date_key, check_equality, push_to_log, quantity, event_date, record_date) => {

    if (!transient_log && !(addition_history && addition_event_date_key && removal_history && removal_event_date_key)) {
        throw new Error("Invalid state: neither transient_log nor addition_history/removal_history provided");
    }

    const list_index = transient_list.findIndex(item => check_equality(item) && quantity <= item.quantity);
    if (list_index === -1) {
        return false;
    }

    if (transient_log) {
        let i = transient_log.length - 1;
        let insert_index = -1;
        for (; i >= 0; i--) {
            if (isDayLessThanOrEqualTo(transient_log[i].event_date, event_date)) {
                if (insert_index === -1) {
                    insert_index = i;
                }
                if (check_equality(transient_log[i])) {
                    if (transient_log[i].quantity < quantity) {
                        return false;
                    }
                    break;
                }
            }
        }
        if (i === -1) {
            return false;
        }

        const log_on_or_before_event_date = transient_log[i];

        if (isSameDay(log_on_or_before_event_date.event_date, event_date)) {
            log_on_or_before_event_date.quantity -= Number(quantity);
            log_on_or_before_event_date.record_date = record_date;
        } else {
            i = insert_index + 1;
            transient_log.splice(i, 0, { ...push_to_log, quantity: log_on_or_before_event_date.quantity - Number(quantity), record_date: record_date, event_date: event_date });
        }

        for (let j = i + 1; j < transient_log.length; j++) {
            if (check_equality(transient_log[j])) {
                transient_log[j].quantity -= Number(quantity);
                transient_log[j].record_date = record_date;
            }
        }

    } else {

        const sorted_additions = [...addition_history].sort((a, b) => new Date(a[addition_event_date_key]) - new Date(b[addition_event_date_key]));
        const sorted_removals = [...removal_history].sort((a, b) => new Date(a[removal_event_date_key]) - new Date(b[removal_event_date_key]));
        let addition_index = 0;
        let removal_index = 0;
        let current_quantity = 0;
        let prev_history_event_date = null;

        while (addition_index < sorted_additions.length || removal_index < sorted_removals.length) {

            let event;
            let mode;
            let history_event_date;

            if (addition_index < sorted_additions.length && (removal_index >= sorted_removals.length || isDayLessThanOrEqualTo(sorted_additions[addition_index][addition_event_date_key], sorted_removals[removal_index][removal_event_date_key]))) {
                event = sorted_additions[addition_index];
                mode = "addition";
                history_event_date = sorted_additions[addition_index][addition_event_date_key];
                addition_index++;
            } else {
                event = sorted_removals[removal_index];
                mode = "removal";
                history_event_date = sorted_removals[removal_index][removal_event_date_key];
                removal_index++;
            }

            if (check_equality(event)) { // sure to be true for some history event since the transient list has an entry satisfying equality and quantity

                // history_event_date has changed and is after event_date
                if (!isDayLessThanOrEqualTo(history_event_date, prev_history_event_date) && !isDayLessThanOrEqualTo(history_event_date, event_date)) {
                    if (current_quantity < quantity) {
                        return false;
                    }
                }


                if (mode === "addition") {
                    current_quantity += Number(event.quantity);
                } else {
                    current_quantity -= Number(event.quantity);
                }
                prev_history_event_date = history_event_date;
            }
        }

        // prev_history_event_date would never be null here since some history event must have satisfied the equality check
        // quantity check has to be done only if prev_history_event_date is after event_date, as for an event after the last history event, quantity check with the transient list is sufficient
        if (!isDayLessThanOrEqualTo(prev_history_event_date, event_date)) {
            if (current_quantity < quantity) {
                return false;
            }
        }
    }


    transient_list[list_index].quantity -= Number(quantity);
    if (transient_list[list_index].quantity === 0) {
        transient_list.splice(list_index, 1);
    } else {
        transient_list[list_index].record_date = record_date;
        if (isDayGreaterThanOrEqualTo(event_date, transient_list[list_index].event_date)) {
            transient_list[list_index].event_date = event_date;
        }
    }
    return true;
}

