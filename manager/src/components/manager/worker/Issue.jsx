import React, { useEffect, useState } from 'react'
import { FormGroup, Select, MenuItem, InputLabel, Input, FormControl, Button, Typography } from '@mui/material'

import { getItemsForIssue, issueToWorker, getPriceForIssue } from '../../../api'

const Issue = ({ worker, manager }) => {
    console.log(worker)
    const [issue, setIssue] = useState({ design_number: "", quantity: "", price: "", underprocessing_value: "", thread_raw_material: "", remarks: "" })
    const [items, setItems] = useState([])
    const [max, setMax] = useState(0)


    const getItemsData = async () => {
        try {
            const res = await getItemsForIssue(manager.manager_id)
            console.log(res.data)
            setItems(res.data)
            setIssue({ design_number: "", quantity: "", price: "", underprocessing_value: "", thread_raw_material: "", remarks: "" })
        }
        catch (err) {
            console.log(err)
        }
    }

    const onItemSelect = async (e) => {

        try {
            const res = await getPriceForIssue(worker.worker_id, e.target.value)
            console.log(res.data)

            setIssue({ ...issue, price: res.data.price, design_number: e.target.value, quantity: "" })
            console.log(issue);
            setMax(res.data.quantity_available)
        }
        catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        console.log("get items")
        console.log(manager)
        getItemsData();
    }, [manager, worker])



    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await issueToWorker(issue, worker.worker_id)
            console.log(res.data)

            setIssue({ design_number: "", quantity: "" })
        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        <div>
            <FormGroup style={{ width: "500px", padding: "20px" }}>
                <InputLabel>Item</InputLabel>
                <Select value={issue.design_number} onChange={onItemSelect}>
                    {items.map((item) => (
                        <MenuItem value={item.design_number}>{item.design_number}-{item.description}</MenuItem>
                    ))}
                </Select>
                <Typography>Price: {issue.price}</Typography>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Quantity</InputLabel>
                    <Input disabled={issue.design_number === ""} inputProps={{ min: 1, max: max }} type="number" value={issue.quantity} onChange={(e) => { setIssue({ ...issue, quantity: e.target.value }); console.log(issue); }} />
                </FormControl>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Underprocessing Value</InputLabel>
                    <Input type="number" value={issue.underprocessing_value} onChange={(e) => { setIssue({ ...issue, underprocessing_value: e.target.value }); console.log(issue); }} />
                </FormControl>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Thread Raw Material</InputLabel>
                    <Input value={issue.thread_raw_material} onChange={(e) => { setIssue({ ...issue, thread_raw_material: e.target.value }); console.log(issue); }} />
                </FormControl>

                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Remarks</InputLabel>
                    <Input value={issue.remarks} onChange={(e) => { setIssue({ ...issue, remarks: e.target.value }); console.log(issue); }} />
                </FormControl>
                <Button variant="contained" color="primary" style={{ width: "100px", marginLeft: "100px", marginTop: "10px" }} onClick={onSubmit}
                    disabled={issue.design_number === "" || issue.quantity === "" || issue.quantity === "0" ||
                        issue.underprocessing_value === "" || issue.underprocessing_value === "0" ||
                        issue.thread_raw_material === "" || issue.remarks === ""}>Issue</Button>
            </FormGroup>

        </div>
    )
}


export default Issue;