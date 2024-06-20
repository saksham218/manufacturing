import React from 'react'
import { Table, TableHead, TableRow, TableCell, Paper, TableBody } from '@mui/material'

const ViewNestedTable = ({ data, firstNonEmptyIndex }) => {
    console.log(data)
    console.log(data[0])
    const keys = Object.keys(data[firstNonEmptyIndex]['items'][0])
    // remove _id if present
    if (keys.includes('_id')) {
        keys.splice(keys.indexOf('_id'), 1)
    }


    return (
        <div style={{ paddingTop: "20px" }}>
            <Table component={Paper} >
                <TableHead>
                    <TableRow>
                        <TableCell>Worker</TableCell>
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
                                    {index === 0 && <TableCell rowSpan={group.items.length} >{group.worker.worker_id}-{group.worker.name}</TableCell>}
                                    {keys.map((key) => {
                                        if (key === 'item') {
                                            return <TableCell>{item[key].design_number}-{item[key].description}</TableCell>
                                        }
                                        else if (key === 'date') {
                                            const date = new Date(item[key])
                                            return <TableCell>{date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate()}/{date.getMonth() < 9 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1)}/{date.getFullYear()}</TableCell>
                                        }
                                        else {
                                            return <TableCell>{item[key]}</TableCell>
                                        }
                                    })}
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