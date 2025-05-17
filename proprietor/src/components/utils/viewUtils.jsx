import HoldInfo from "../layouts/HoldInfo"

export const computeContent = (item, key) => {
    if (key === 'worker') {
        return `${item[key].worker_id}-${item[key].name}`
    }
    else if (key === 'manager') {
        return `${item[key].manager_id}-${item[key].name}`
    }
    else if (key === 'item') {
        return `${item[key].design_number}-${item[key].description}`
    }
    else if (key.includes('date')) {
        console.log(`${key}:${item[key]}`)
        const date = new Date(item[key])
        return `${date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate()}/${date.getMonth() < 9 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1)}/${date.getFullYear()}`
    }
    else if (key === 'hold_info') {
        return item[key]?.is_hold ? <HoldInfo holdInfo={item[key]} /> : ""
    }
    else {
        return item[key]
    }
}

export const computeBackgroundColor = (item) => {
    if (item?.is_adhoc && item?.to_hold) {
        return 'pink'
    }

    if (item?.is_adhoc) {
        return 'yellow'
    }

    if ((item?.to_hold)) {
        return 'orange'
    }

    return 'white'
}

export const filterKeys = (keys) => {
    const notRequired = ['_id', 'is_adhoc', 'to_hold']
    return keys.filter((key) => !notRequired.includes(key))
}
