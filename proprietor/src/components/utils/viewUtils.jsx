import HoldInfo from "../layouts/HoldInfo"
import { Chip, Stack } from "@mui/material"

export const computeContent = (item, key, forSearch) => {
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
        const date = new Date(item[key])
        return `${date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate()}/${date.getMonth() < 9 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1)}/${date.getFullYear()}`
    }
    else if (key === 'info') {

        if (forSearch) {
            let keywordString = ''
            keywordString += !!item['is_adhoc'] ? 'Adhoc' : ''
            keywordString += !!item['to_hold'] ? 'Hold' : ''
            keywordString += item['hold_info']?.is_hold ? 'Hold Info' : ''
            return keywordString
        }

        return (<Stack direction="column" spacing={1}>
            {!!item['is_adhoc'] && <Chip label="Adhoc" size="small" style={{
                backgroundColor: 'yellow',
                color: 'black',
                width: '70px'
            }} />}
            {!!item['to_hold'] && <Chip label="Hold" size="small" style={{
                backgroundColor: 'orange',
                color: 'black',
                width: '70px'
            }} />}
            {item['hold_info']?.is_hold ? <HoldInfo holdInfo={item['hold_info']} size="small" style={{
                width: '70px'
            }} /> : ""}
        </Stack>)

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

export const computeKey = (obj, keys) => {
    if (!keys) {
        keys = Object.keys(obj).filter((key) => !['_id', 'quantity'].includes(key))
    }
    const objectForKey = {}
    keys.forEach(key => { objectForKey[key] = obj[key] })
    return JSON.stringify(objectForKey)
}

export const searchNestedByKeyword = (data, keyword, groupingKeys, keys) => {
    if (!keyword?.trim()) {
        return data;
    }

    keys = keys || [];
    const searchTerm = keyword.toLowerCase();

    return data
        .map(group => {
            // Check if the group itself matches the search
            const isGroupMatch = groupingKeys?.some(key => {
                const content = computeContent(group, key, true);
                return content && String(content).toLowerCase().includes(searchTerm);
            });

            // Filter items in the group
            const filteredItems = isGroupMatch
                ? group.items // If group matches, include all items
                : group.items?.filter(item =>
                    keys?.some(key => {
                        const content = computeContent(item, key, true);
                        return content && String(content).toLowerCase().includes(searchTerm);
                    })
                );

            // Only include the group if it has matching items or the group itself matches
            return filteredItems?.length > 0 ? { ...group, items: filteredItems } : null;
        })
        .filter(Boolean); // Remove null entries (groups with no matches)
};

export const searchByKeyword = (data, keyword, keys) => {
    if (!keyword?.trim()) {
        return data;
    }

    keys = keys || []

    const searchTerm = keyword.toLowerCase()

    const filteredData = data?.filter((item) => {
        return keys?.some((key) => {
            const content = computeContent(item, key, true)
            return content && String(content).toLowerCase().includes(searchTerm)
        })
    })

    return filteredData
}