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


export const isSameHoldInfo = (hold_info1, hold_info2) => {
    console.log("(from array) hold_info1: ", hold_info1);
    console.log("hold_info2: ", hold_info2);
    console.log("hi");

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
    accepted_history: {
        subpaths: {
            items: {}
        }
    },
    due_forward: {},
    due_backward: {
        subpaths: {
            items: {}
        }
    },
    submissions: {
        subpaths: {
            items: {}
        }
    },
    total_due: {},
    forfeited_history: {
        subpaths: {
            items: {}
        }
    },
    on_hold_history: {
        subpaths: {
            items: {}
        }
    }
}

export const workerPopulatePaths = {
    due_items: {},
    issue_history: {},
    submit_history: {},
    deductions_from_proprietor: {},
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

