import React, { useEffect, useState } from 'react'
import { Table, TableHead, TableBody, TableRow, TableCell, Paper, TextField, Box } from '@mui/material'

import { computeContent, searchByKeyword } from '../utils/viewUtils'

const ViewTable = ({ data, keys }) => {
    const [keyword, setKeyword] = useState('')
    const [filteredData, setFilteredData] = useState([])

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
        const filtered = searchByKeyword(data, keyword, keys)
        setFilteredData(filtered || [])
    }, [data, keyword, keys])


    return (
        <Box sx={{ paddingTop: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                label="Search"
                variant="outlined"
                size="small"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                sx={{ width: 300 }}
            />
            <Table component={Paper}>
                <TableHead>
                    <TableRow>
                        {keys.map((key) => (

                            <TableCell>{key.split('_').map((p) => (p.charAt(0).toUpperCase() + p.slice(1))).join(' ')}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredData.map((row, index) => (
                        <TableRow onClick={() => handleRowClick(index)}>
                            {keys.map((key) => {
                                return <TableCell sx={{ backgroundColor: selected === index ? 'lightblue' : 'white' }}>{computeContent(row, key)}</TableCell>
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    )
}

export default ViewTable