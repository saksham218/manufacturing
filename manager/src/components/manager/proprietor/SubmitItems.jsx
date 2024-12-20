import React, { useEffect, useState } from 'react'
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Button, Input, FormControl, FormGroup } from '@mui/material'

import { getItemsForFinalSubmit, submitToProprietor } from '../../../api'

const keys = ['item', 'quantity', 'price', 'deduction_from_manager', 'remarks_from_manager', 'underprocessing_value', 'remarks_from_proprietor']

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


const SubmitItems = ({ manager }) => {

    const [dueBackward, setDueBackward] = useState([])


    const getItemsData = async () => {
        try {
            const res = await getItemsForFinalSubmit(manager.manager_id)
            console.log(res.data)
            const itemsData = res.data;
            itemsData.forEach((group) => {
                group.items = group.items.map((item) => {
                    return { ...item, submit_quantity: "" }
                });
            });

            setDueBackward(itemsData)
        }
        catch (err) {
            console.log(err)
        }
    }

    const onSubmit = async (e, groupIndex, index) => {
        try {
            const submission = {
                worker_id: dueBackward[groupIndex].worker.worker_id,
                design_number: dueBackward[groupIndex].items[index].item.design_number,
                submit_quantity: dueBackward[groupIndex].items[index].submit_quantity,
                price: dueBackward[groupIndex].items[index].price,
                deduction_from_manager: dueBackward[groupIndex].items[index].deduction_from_manager,
                remarks_from_manager: dueBackward[groupIndex].items[index].remarks_from_manager,
                underprocessing_value: dueBackward[groupIndex].items[index].underprocessing_value,
                remarks_from_proprietor: dueBackward[groupIndex].items[index].remarks_from_proprietor,
                is_adhoc: dueBackward[groupIndex].items[index].is_adhoc
            }
            console.log(submission)
            const res = await submitToProprietor(submission, manager.manager_id)
            console.log(res.data)
            await getItemsData()
        }
        catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getItemsData()
    }, [manager])

    return (
        <div style={{ paddingTop: "20px", width: "1200px" }}>
            <Table component={Paper} >
                <TableHead>
                    <TableRow>
                        <TableCell style={{ width: "80px" }}>Worker</TableCell>
                        {keys.map((key) => (
                            <TableCell>{key.split('_').map((p) => (p.charAt(0).toUpperCase() + p.slice(1))).join(' ')}</TableCell>
                        ))}
                        <TableCell style={{ width: "225px" }}>Submit </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dueBackward.map((group, groupIndex) => (
                        <React.Fragment>
                            {
                                group.items.map((item, index) => (

                                    <TableRow>
                                        {index === 0 && <TableCell rowSpan={group.items.length}>{group.worker.worker_id}-{group.worker.name}</TableCell>}
                                        {keys.map((key) => {
                                            return <TableCell style={{ 'backgroundColor': item?.is_adhoc ? 'yellow' : 'white' }}>{computeContent(item, key)}</TableCell>
                                        })}
                                        <TableCell style={{ width: "225px", 'backgroundColor': item?.is_adhoc ? 'yellow' : 'white' }}>

                                            <Input type="number" placeholder='submit quantity' inputProps={{ min: 0, max: item.quantity }} style={{ width: "135px", marginRight: "10px" }}
                                                value={item.submit_quantity} onChange={(e) => { let dueBackwardData = dueBackward; dueBackwardData[groupIndex].items[index].submit_quantity = e.target.value; setDueBackward([...dueBackwardData]); }}
                                                onWheel={(e) => { e.target.blur(); }}
                                            />

                                            <Button variant="contained" color="primary" onClick={(e) => { onSubmit(e, groupIndex, index) }}
                                                style={{ marginTop: "10px" }}
                                                disabled={item.submit_quantity < 1 || item.submit_quantity > item.quantity}>Submit</Button>

                                        </TableCell>

                                    </TableRow>

                                ))
                            }
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}


export default SubmitItems