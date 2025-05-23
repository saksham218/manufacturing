import React, { useEffect, useState } from 'react'
import { Table, TableHead, TableRow, TableCell, Paper, TableBody, Divider } from '@mui/material'

import { computeContent } from '../utils/viewUtils'

const ViewNestedTable = ({ data, groupingKeys, keys, additionalComponents }) => {
    console.log(data)
    console.log(groupingKeys)
    console.log(keys)
    console.log(additionalComponents)

    const [selected, setSelected] = useState({ groupIndex: null, itemIndex: null })

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
    }, [data])

    return (
        <div style={{ paddingTop: "20px" }}>
            <Table component={Paper} >
                <TableHead>
                    <TableRow>
                        {
                            groupingKeys.map((key) => (
                                <TableCell>{key.split('_').map((p) => (p.charAt(0).toUpperCase() + p.slice(1))).join(' ')}</TableCell>
                            ))
                        }
                        {
                            keys.map((key) => (
                                <TableCell>{key.split('_').map((p) => (p.charAt(0).toUpperCase() + p.slice(1))).join(' ')}</TableCell>
                            ))
                        }
                        {
                            additionalComponents &&
                            additionalComponents.map((component) => (
                                <TableCell>{component.label.split('_').map((p) => (p.charAt(0).toUpperCase() + p.slice(1))).join(' ')}</TableCell>
                            ))
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((group, groupIndex) => (
                        <React.Fragment>
                            {group.items.map((item, itemIndex) => (
                                <TableRow
                                    onClick={() => { handleRowClick(groupIndex, itemIndex) }}
                                >

                                    {
                                        itemIndex === 0 &&
                                        groupingKeys.map((key) => {
                                            return <TableCell rowSpan={group.items.length} sx={{ backgroundColor: selected.groupIndex === groupIndex ? 'lightblue' : 'white' }}>{computeContent(group, key)}</TableCell>
                                        })
                                    }
                                    {/* <TableCell rowSpan={group.items.length} >{group.worker.worker_id}-{group.worker.name}</TableCell>} */}
                                    {
                                        keys.map((key) => {
                                            return <TableCell sx={{ backgroundColor: (selected.groupIndex === groupIndex && selected.itemIndex === itemIndex) ? 'lightblue' : 'white' }}>{computeContent(item, key)}</TableCell>
                                        })
                                    }
                                    {
                                        additionalComponents &&
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
                                <TableCell colSpan={groupingKeys?.length + keys?.length + (additionalComponents ? additionalComponents?.length : 0)} sx={{ padding: 0 }}>
                                    <Divider style={{ backgroundColor: 'black', height: '3px', }} />
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default ViewNestedTable