import React, { useEffect, useState } from 'react'
import { Table, TableHead, TableRow, TableCell, Paper, TableBody, Divider, TextField, Box } from '@mui/material'

import { computeContent, computeKey, searchNestedByKeyword } from '../utils/viewUtils'

const ViewNestedTable = ({ data, groupingKeys, keys, additionalComponents }) => {
    console.log(data)
    console.log(groupingKeys)
    console.log(keys)
    console.log(additionalComponents)

    const [selected, setSelected] = useState({ groupIndex: null, itemIndex: null })
    const [filteredData, setFilteredData] = useState([])
    const [keyword, setKeyword] = useState('')

    const handleRowClick = (groupIndex, itemIndex) => {
        if (selected.groupIndex === groupIndex && selected.itemIndex === itemIndex) {
            setSelected({ groupIndex: null, itemIndex: null })
        }
        else {
            setSelected({ groupIndex, itemIndex })
        }
    }

    useEffect(() => {
        setSelected({ groupIndex: null, itemIndex: null })
        const filtered = searchNestedByKeyword(data, keyword, groupingKeys, keys)
        setFilteredData(filtered || [])
    }, [keyword, data, groupingKeys, keys])

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
                        {
                            groupingKeys?.map((key) => (
                                <TableCell>{key.split('_').map((p) => (p.charAt(0).toUpperCase() + p.slice(1))).join(' ')}</TableCell>
                            ))
                        }
                        {
                            keys?.map((key) => (
                                <TableCell>{key.split('_').map((p) => (p.charAt(0).toUpperCase() + p.slice(1))).join(' ')}</TableCell>
                            ))
                        }
                        {
                            additionalComponents?.length > 0 &&
                            additionalComponents.map((component) => (
                                <TableCell>{component.label.split('_').map((p) => (p.charAt(0).toUpperCase() + p.slice(1))).join(' ')}</TableCell>
                            ))
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredData?.map((group, groupIndex) => (
                        <React.Fragment key={computeKey(group, groupingKeys)}>
                            {group.items?.map((item, itemIndex) => (
                                <TableRow
                                    onClick={() => { handleRowClick(groupIndex, itemIndex) }}
                                    key={computeKey(item)}
                                >

                                    {
                                        itemIndex === 0 &&
                                        groupingKeys?.map((key) => {
                                            return <TableCell rowSpan={group.items?.length} sx={{ backgroundColor: selected.groupIndex === groupIndex ? 'lightblue' : 'white' }}>{computeContent(group, key)}</TableCell>
                                        })
                                    }
                                    {/* <TableCell rowSpan={group.items.length} >{group.worker.worker_id}-{group.worker.name}</TableCell>} */}
                                    {
                                        keys?.map((key) => {
                                            return <TableCell sx={{ backgroundColor: (selected.groupIndex === groupIndex && selected.itemIndex === itemIndex) ? 'lightblue' : 'white' }}>{computeContent(item, key)}</TableCell>
                                        })
                                    }
                                    {
                                        additionalComponents?.length > 0 &&
                                        additionalComponents.map((component) => {

                                            return (
                                                <TableCell sx={{ backgroundColor: (selected.groupIndex === groupIndex && selected.itemIndex === itemIndex) ? 'lightblue' : 'white' }}>

                                                    <component.component item={item} group={group} {...component.props} />

                                                </TableCell>
                                            )
                                        })
                                    }
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell colSpan={groupingKeys?.length + keys?.length + (additionalComponents?.length > 0 ? additionalComponents?.length : 0)} sx={{ padding: 0 }}>
                                    <Divider style={{ backgroundColor: 'black', height: '3px', }} />
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </Box>
    )
}

export default ViewNestedTable