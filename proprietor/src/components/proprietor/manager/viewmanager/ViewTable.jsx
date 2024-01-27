import { Table, TableHead, TableRow, TableCell, Paper } from '@mui/material'
import React from 'react'

const ViewTable = ({ data }) => {
    const keys = data[0].keys()
    return (
        <div>
            <Table component={Paper}>
                <TableHead>
                    <TableRow>
                        {keys.map((key) => (
                            <TableCell>{key}</TableCell>
                        ))}
                    </TableRow>
                    {data.map((row) => (
                        <TableRow>
                            {row.values().map((item) => (
                                <TableCell>{item}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableHead>

            </Table>
        </div>
    )
}

export default ViewTable