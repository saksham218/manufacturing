import { Table, TableHead, TableRow, TableCell, Paper } from '@mui/material'
import React from 'react'

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

                            <TableCell>{key.charAt(0).toUpperCase() + key.slice(1)}</TableCell>
                        ))}
                    </TableRow>
                    {data.map((row) => (
                        <TableRow>
                            {keys.map((key) => {
                                if (key === 'date') {
                                    const date = new Date(row[key])
                                    return <TableCell>{date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}</TableCell>
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