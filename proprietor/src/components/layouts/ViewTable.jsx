import React, { useEffect, useState } from 'react'
import { Table, TableHead, TableRow, TableCell, Paper } from '@mui/material'

import { computeContent } from '../utils/viewUtils'

const ViewTable = ({ data, keys }) => {
    console.log(data)
    console.log(data[0])

    const [selected, setSelected] = useState(null)

    const handleRowClick = (index) => {
        if (selected === index) {
            setSelected(null)
        }
        else {
            setSelected(index)
        }
    }

    useEffect(() => {
        setSelected(null)
    }, [data])

    return (
        <div style={{ paddingTop: "20px" }}>
            <Table component={Paper} >
                <TableHead>
                    <TableRow>
                        {keys.map((key) => (

                            <TableCell>{key.split('_').map((p) => (p.charAt(0).toUpperCase() + p.slice(1))).join(' ')}</TableCell>
                        ))}
                    </TableRow>
                    {data.map((row, index) => (
                        <TableRow onClick={() => handleRowClick(index)}>
                            {keys.map((key) => {
                                return <TableCell sx={{ backgroundColor: selected === index ? 'lightblue' : 'white' }}>{computeContent(row, key)}</TableCell>
                            })}
                        </TableRow>
                    ))}
                </TableHead>

            </Table>
        </div>
    )
}

export default ViewTable