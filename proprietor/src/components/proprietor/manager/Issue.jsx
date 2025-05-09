import React, { useEffect, useState } from 'react'
import { FormGroup, Select, MenuItem, InputLabel, Input, FormControl, Button, Typography } from '@mui/material'

import { getItems, issueToManager } from '../../../api'
import { useManager } from './managerContext/ManagerContext'


const getItemsData = async (proprietor_id) => {
    try {
        const res = await getItems(proprietor_id)
        console.log(res.data)
        return res.data
    }
    catch (err) {
        console.log(err)
    }
}

const Issue = ({ proprietor }) => {

    const { manager } = useManager()
    console.log(manager)
    const [issue, setIssue] = useState({ design_number: "", quantity: "", underprocessing_value: "", general_price: "", remarks: "" })
    const [items, setItems] = useState([])

    useEffect(() => {
        console.log("get items")
        console.log(proprietor)
        getItemsData(proprietor.proprietor_id).then((itemsData) => {
            setItems(itemsData)
        });
    }, [proprietor])

    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await issueToManager(issue, manager.manager_id)
            console.log(res.data)
            setIssue({ design_number: "", quantity: "", underprocessing_value: "", general_price: "", remarks: "" })
        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        <div>
            <FormGroup style={{ width: "500px", padding: "20px" }}>
                <InputLabel>Item</InputLabel>
                <Select value={issue.design_number} onChange={(e) => { const index = items.findIndex((i) => { return e.target.value === i.design_number; }); setIssue({ ...issue, design_number: e.target.value, general_price: items[index].price, quantity: "", underprocessing_value: items[index].underprocessing_value, thread_raw_material: "", remarks: "" }); console.log(issue); }}>
                    {items.map((item) => (
                        <MenuItem value={item.design_number}>{item.design_number}-{item.description}</MenuItem>
                    ))}
                </Select>
                <Typography>General price: {issue.general_price}</Typography>
                <FormControl style={{ marginTop: "15px" }}>
                    <InputLabel>Quantity</InputLabel>
                    <Input type="number" value={issue.quantity}
                        inputProps={{ min: 0 }}
                        onChange={(e) => { setIssue({ ...issue, quantity: e.target.value }); console.log(issue); }}
                        onWheel={(e) => { e.target.blur(); }}
                    />
                </FormControl>
                <FormControl style={{ marginTop: "15px" }}>
                    <InputLabel>Underprocessing Value</InputLabel>
                    <Input type="number" value={issue.underprocessing_value}
                        inputProps={{ min: 0 }}
                        onChange={(e) => { setIssue({ ...issue, underprocessing_value: e.target.value }); console.log(issue); }}
                        onWheel={(e) => { e.target.blur() }} />
                </FormControl>
                {/* <FormControl style={{ marginTop: "15px" }}>
                    <InputLabel>Thread Raw Material</InputLabel>
                    <Input value={issue.thread_raw_material} onChange={(e) => { setIssue({ ...issue, thread_raw_material: e.target.value }); console.log(issue); }} />
                </FormControl> */}

                <FormControl style={{ marginTop: "15px" }}>
                    <InputLabel>Remarks</InputLabel>
                    <Input value={issue.remarks} onChange={(e) => { setIssue({ ...issue, remarks: e.target.value }); console.log(issue); }} />
                </FormControl>
                <Button variant="contained" color="primary" style={{ width: "100px", marginLeft: "100px", marginTop: "10px" }} onClick={onSubmit}
                    disabled={issue.design_number === "" || issue.quantity === "" || issue.quantity === "0" ||
                        issue.underprocessing_value === "" || issue.underprocessing_value === "0"}>Issue</Button>
            </FormGroup>

        </div>
    )
}


export default Issue;