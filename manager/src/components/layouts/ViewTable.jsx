import React from 'react'
import { Table, TableHead, TableRow, TableCell, Paper } from '@mui/material'

import { computeContent, computeBackgroundColor, filterKeys } from '../utils/viewUtils'

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
                                return <TableCell style={{ 'backgroundColor': computeBackgroundColor(row) }}>{computeContent(row, key)}</TableCell>
                            })}
                        </TableRow>
                    ))}
                </TableHead>

            </Table>
        </div>
    )
}

export default ViewTable