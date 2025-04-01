import React from 'react'
import { Table, TableHead, TableRow, TableCell, Paper, TableBody } from '@mui/material'

const computeContent = (obj, key) => {
    const value = obj[key]
    if (key === 'item') {
        return `${value.design_number}-${value.description}`
    }
    else if (key === 'date') {
        const date = new Date(value)
        return `${date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate()}/${date.getMonth() < 9 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1)}/${date.getFullYear()}`
    }
    else if (key === 'worker') {
        return `${value.worker_id}-${value.name}`
    }
    else {
        return value
    }
}

const filterKeys = (keys) => {
    const notRequired = ['_id', 'is_adhoc']
    return keys.filter((key) => !notRequired.includes(key))
}

const ViewNestedTable = ({ data, groupKeys, firstNonEmptyIndex }) => {
    console.log(data)
    console.log(data[0])
    let keys = Object.keys(data[firstNonEmptyIndex]['items'][0])

    keys = filterKeys(keys)

    return (
        <div style={{ paddingTop: "20px" }}>
            <Table component={Paper} >
                <TableHead>
                    <TableRow>
                        {groupKeys.map((key) => (
                            <TableCell>{key.split('_').map((p) => (p.charAt(0).toUpperCase() + p.slice(1))).join(' ')}</TableCell>
                        ))
                        }
                        {keys.map((key) => (
                            <TableCell>{key.split('_').map((p) => (p.charAt(0).toUpperCase() + p.slice(1))).join(' ')}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((group) => (
                        <React.Fragment>
                            {group.items.map((item, index) => (
                                <TableRow>
                                    {
                                        index === 0 &&
                                        groupingKeys.map((key) => {
                                            return <TableCell rowSpan={group.items.length}>{computeContent(group, key)}</TableCell>
                                        })
                                    }
                                    {/* <TableCell rowSpan={group.items.length} >{group.worker.worker_id}-{group.worker.name}</TableCell>} */}
                                    {
                                        keys.map((key) => {
                                            return <TableCell style={{ 'backgroundColor': item?.is_adhoc ? 'yellow' : 'white' }}>{computeContent(item, key)}</TableCell>
                                        })
                                    }
                                </TableRow>
                            ))}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default ViewNestedTable