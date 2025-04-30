import React, { useState, useEffect } from 'react'
import { Table, TableHead, TableRow, TableCell, Paper, TableBody, Divider } from '@mui/material'

import { computeContent, computeBackgroundColor, filterKeys } from '../utils/viewUtils'

const ViewNestedTable = ({ data, groupingKeys, firstNonEmptyIndex, additionalComponents }) => {
    console.log(data)
    console.log(data[0])
    let keys = Object.keys(data[firstNonEmptyIndex]['items'][0])

    keys = filterKeys(keys)

    return (
        <div style={{ paddingTop: "20px" }}>
            <Table component={Paper} >
                <TableHead>
                    <TableRow>
                        {groupingKeys.map((key) => (
                            <TableCell>{key.split('_').map((p) => (p.charAt(0).toUpperCase() + p.slice(1))).join(' ')}</TableCell>
                        ))
                        }
                        {keys.map((key) => (
                            <TableCell>{key.split('_').map((p) => (p.charAt(0).toUpperCase() + p.slice(1))).join(' ')}</TableCell>
                        ))}
                        {
                            additionalComponents &&
                            additionalComponents.map((component) => (
                                <TableCell>{component.label.split('_').map((p) => (p.charAt(0).toUpperCase() + p.slice(1))).join(' ')}</TableCell>
                            ))
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((group) => (
                        <React.Fragment>
                            {group.items.map((item, index) => (
                                <TableRow>
                                    {
                                        index === 0 &&
                                        groupingKeys.map((key) => {
                                            return <TableCell rowSpan={group.items.length}>{computeContent(group, key)}</TableCell>
                                        })
                                    }
                                    {/* <TableCell rowSpan={group.items.length} >{group.worker.worker_id}-{group.worker.name}</TableCell>} */}
                                    {
                                        keys.map((key) => {
                                            return <TableCell style={{ 'backgroundColor': computeBackgroundColor(item) }}>{computeContent(item, key)}</TableCell>
                                        })
                                    }
                                    {
                                        additionalComponents &&
                                        additionalComponents.map((component) => {

                                            return (
                                                <TableCell style={{ 'backgroundColor': computeBackgroundColor(item) }}>

                                                    <component.component item={item} group={group} {...component.props} />

                                                </TableCell>
                                            )
                                        })
                                    }
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell colSpan={groupingKeys?.length + keys?.length + (additionalComponents ? additionalComponents?.length : 0)} style={{ padding: 0 }}>
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