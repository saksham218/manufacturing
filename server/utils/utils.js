import _ from "lodash";

import Worker from "../models/worker.js";
import Manager from "../models/manager.js";
import Item from "../models/item.js";
import mongoCache from "../cache/mongocache.js";

const depopulateObject = (obj) => {
    if (obj && obj._id) {
        return obj._id;
    }
    return obj;
}

const populateKeys = ['worker', 'manager'];

export const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
}


export const isSameHoldInfo = (item, hold_info) => {
    return _.isEqual(item.hold_info, hold_info);
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

export const prepare = async (paths, obj, pOrdp) => {

    for (const path in paths) {
        console.log(path)
        if (obj[path]) {
            obj[path] = await Promise.all(_.map(obj[path], async data => {
                if (paths[path].subpaths) {
                    const response = await prepare(path.subpaths, data, pOrdp)
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
    console.log("populate hold_info: ", hold_info);
    if (!hold_info || !hold_info.is_hold) {
        return hold_info;
    }

    for (const key of populateKeys) {
        console.log("populating: ", key)

        hold_info[key] = await mongoCache.get(key, hold_info[key].toString());
    }

    if ('prev_hold_info' in hold_info) {
        hold_info['prev_hold_info'] = await populateHoldInfo(hold_info.prev_hold_info)
    }

    console.log("populated: ", hold_info)
    return hold_info;
}

export const depopulateHoldInfo = async (hold_info) => {
    // console.log("depopulate hold_info: ", hold_info);
    if (!hold_info || !hold_info.is_hold) {
        return hold_info;
    }

    for (const key of populateKeys) {
        console.log("depopulating: ", key)
        if (key in hold_info) {
            const cacheResponse = await mongoCache.get(key, hold_info[key]['_id'].toString());
            if (cacheResponse) {
                hold_info[key] = depopulateObject(cacheResponse);
                console.log(typeof hold_info[key])
            }
        }
    }

    if ('prev_hold_info' in hold_info) {
        hold_info['prev_hold_info'] = await depopulateHoldInfo(hold_info.prev_hold_info)
    }

    return hold_info;
}

