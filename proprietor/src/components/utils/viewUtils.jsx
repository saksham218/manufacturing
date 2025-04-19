export const computeContent = (item, key) => {
    if (key === 'worker') {
        return `${item[key].worker_id}-${item[key].name}`
    }
    else if (key === 'item') {
        return `${item[key].design_number}-${item[key].description}`
    }
    else if (key === 'date' || key === 'deduction_date') {
        const date = new Date(item[key])
        return `${date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate()}/${date.getMonth() < 9 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1)}/${date.getFullYear()}`
    }
    else {
        return item[key]
    }
}

export const computeBackgroundColor = (item) => {
    if (item?.is_adhoc && (item?.to_hold || item?.held_by_manager)) {
        return 'pink'
    }

    if (item?.is_adhoc) {
        return 'yellow'
    }

    if ((item?.to_hold) || (item?.held_by_manager)) {
        return 'orange'
    }

    return 'white'
}

export const filterKeys = (keys) => {
    const notRequired = ['_id', 'is_adhoc', 'to_hold', 'held_by_manager']
    return keys.filter((key) => !notRequired.includes(key))
}
