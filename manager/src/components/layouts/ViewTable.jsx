import React from 'react'
import { Table, TableHead, TableRow, TableCell, Paper } from '@mui/material'

const ViewTable = ({ data }) => {
    console.log(data)
    console.log(data[0])
    const keys = Object.keys(data[0])
    // remove _id if present
    if (keys.includes('_id')) {
        keys.splice(keys.indexOf('_id'), 1)
    }

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
                                if (key === 'date') {
                                    const date = new Date(row[key])
                                    return <TableCell>{date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate()}/{date.getMonth() < 9 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1)}/{date.getFullYear()}</TableCell>
                                }
                                else if (key === 'item') {
                                    return <TableCell>{row[key].design_number}-{row[key].description}</TableCell>
                                }
                                else {
                                    return <TableCell>{row[key]}</TableCell>
                                }
                            })}
                        </TableRow>
                    ))}
                </TableHead>

            </Table>
        </div>
    )
}

export default ViewTable