import React from 'react'
import { Table, TableHead, TableRow, TableCell, Paper, TableBody, Divider } from '@mui/material'

import { computeContent } from '../utils/viewUtils'

const ViewNestedTable = ({ data, groupingKeys, keys, additionalComponents }) => {
    console.log(data)
    console.log(groupingKeys)
    console.log(keys)
    console.log(additionalComponents)

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
                                            return <TableCell >{computeContent(item, key)}</TableCell>
                                        })
                                    }
                                    {
                                        additionalComponents &&
                                        additionalComponents.map((component) => {

                                            return (
                                                <TableCell >

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