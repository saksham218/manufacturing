import React, { useState } from 'react'
import { Table, TableHead, TableRow, TableCell, Paper, Button, FormControl, Input, TableBody } from '@mui/material'

import { useEffect } from 'react'
import { getSubmissions, acceptFromManager } from '../../../api'

const keys = ['item', 'quantity', 'price', 'deduction_from_manager', 'remarks_from_manager', 'underprocessing_value', 'remarks_from_proprietor', 'date']

const computeContent = (item, key) => {
    if (key === 'item') {
        return `${item[key].design_number}-${item[key].description}`
    }
    else if (key === 'date') {
        const date = new Date(item[key])
        return `${date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate()}/${date.getMonth() < 9 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1)}/${date.getFullYear()}`
    }
    else {
        return item[key]
    }
}

const Accept = ({ manager }) => {

    const [submissions, setSubmissions] = useState([])

    const getSubmissionsData = async () => {
        try {
            const res = await getSubmissions(manager.manager_id);
            console.log(res.data)
            const submissionsData = res.data;
            submissionsData.forEach((group) => {
                group.items = group.items.map((item) => {
                    return { ...item, accept_quantity: "", deduction: "", final_remarks: "" }
                });
            });
            setSubmissions(submissionsData)
        }
        catch (err) {
            console.log(err)
        }
    }


    useEffect(() => {
        getSubmissionsData();
    }, [manager])

    const onSubmit = async (e, groupIndex, index) => {
        try {
            const accepted = {
                worker_id: submissions[groupIndex].worker.worker_id,
                design_number: submissions[groupIndex].items[index].item.design_number,
                accept_quantity: submissions[groupIndex].items[index].accept_quantity,
                price: submissions[groupIndex].items[index].price,
                deduction_from_manager: submissions[groupIndex].items[index].deduction_from_manager,
                remarks_from_manager: submissions[groupIndex].items[index].remarks_from_manager,
                underprocessing_value: submissions[groupIndex].items[index].underprocessing_value,
                remarks_from_proprietor: submissions[groupIndex].items[index].remarks_from_proprietor,
                deduction: submissions[groupIndex].items[index].deduction,
                final_remarks: submissions[groupIndex].items[index].final_remarks,
                is_adhoc: submissions[groupIndex].items[index].is_adhoc
            }
            console.log(accepted)
            const res = await acceptFromManager(accepted, manager.manager_id)
            console.log(res.data)
            await getSubmissionsData();
        }
        catch (err) {
            console.log(err)
        }
    }



    return (
        <div style={{ paddingTop: "20px", width: "1500px" }}>
            <Table component={Paper} >
                <TableHead>
                    <TableRow>
                        <TableCell>Worker</TableCell>
                        {keys.map((key) => (
                            <TableCell>{key.split('_').map((p) => (p.charAt(0).toUpperCase() + p.slice(1))).join(' ')}</TableCell>
                        ))}
                        <TableCell style={{ width: "200px" }}>Accept </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {submissions.map((group, groupIndex) => (
                        <React.Fragment>
                            {group.items.map((item, index) => (
                                <TableRow>
                                    {index === 0 && <TableCell rowSpan={group.items.length} >{group.worker.worker_id}-{group.worker.name}</TableCell>}
                                    {keys.map((key) => {
                                        return <TableCell style={{ 'backgroundColor': item?.is_adhoc ? 'yellow' : 'white' }}>{computeContent(item, key)}</TableCell>
                                    })}
                                    <TableCell style={{ 'backgroundColor': item?.is_adhoc ? 'yellow' : 'white' }}>

                                        <Input type="number" placeholder="accept quantity" inputProps={{ min: 0, max: item.quantity }} style={{ marginTop: "10px", width: "150px" }} value={item.accept_quantity}
                                            onChange={(e) => { const submissionsData = submissions; submissionsData[groupIndex].items[index].accept_quantity = e.target.value; setSubmissions([...submissionsData]) }}
                                            onWheel={(e) => { e.target.blur(); }}
                                        />

                                        <Input type="number" placeholder="deduction" inputProps={{ min: 0, max: item.price }} style={{ marginTop: "10px", width: "150px" }} value={item.deduction}
                                            onChange={(e) => { const submissionsData = submissions; submissionsData[groupIndex].items[index].deduction = e.target.value; setSubmissions([...submissionsData]) }}
                                            onWheel={(e) => { e.target.blur(); }}
                                        />

                                        <Input type="text" placeholder="final remarks" style={{ marginTop: "10px", width: "150px" }} value={item.final_remarks}
                                            onChange={(e) => { const submissionsData = submissions; submissionsData[groupIndex].items[index].final_remarks = e.target.value; setSubmissions([...submissionsData]) }} />

                                        <Button variant="contained" color="primary" style={{ marginTop: "10px", height: "25px", width: "35px", fontSize: "12px" }}
                                            disabled={item.accept_quantity < 1 || item.accept_quantity > item.quantity || item.deduction > item.price || (item.deduction > 0 && item.final_remarks === "")}
                                            onClick={(e) => { onSubmit(e, groupIndex, index) }}>Accept</Button>

                                    </TableCell>

                                </TableRow>
                            ))}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default Accept