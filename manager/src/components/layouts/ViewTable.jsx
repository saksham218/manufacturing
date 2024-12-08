import React from 'react'
import { Table, TableHead, TableRow, TableCell, Paper } from '@mui/material'

const computeContent = (item, key) => {
    if (key === 'item') {
        return `${item[key].design_number}-${item[key].description}`
    }
    else if (key === 'date') {
        const date = new Date(item[key])
        return `${date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate()}/${date.getMonth() < 9 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1)}/${date.getFullYear()}`
    }
    else {
        return item[key]
    }
}

const filterKeys = (keys) => {
    const notRequired = ['_id', 'is_adhoc']
    return keys.filter((key) => !notRequired.includes(key))
}

const ViewTable = ({ data }) => {
    console.log(data)
    console.log(data[0])
    let keys = Object.keys(data[0])

    keys = filterKeys(keys)


    return (
        <div style={{ paddingTop: "20px" }}>
            <Table component={Paper} >
                <TableHead>
                    <TableRow>
                        {keys.map((key) => (

                            <TableCell>{key.split('_').map((p) => (p.charAt(0).toUpperCase() + p.slice(1))).join(' ')}</TableCell>
                        ))}
                    </TableRow>
                    {data.map((row) => (
                        <TableRow>
                            {keys.map((key) => {
                                return <TableCell style={{ 'backgroundColor': row?.is_adhoc ? 'yellow' : 'white' }}>{computeContent(row, key)}</TableCell>
                            })}
                        </TableRow>
                    ))}
                </TableHead>

            </Table>
        </div>
    )
}

export default ViewTable