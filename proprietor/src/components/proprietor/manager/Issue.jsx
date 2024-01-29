import React, { useEffect, useState } from 'react'
import { FormGroup, Select, MenuItem, InputLabel, Input, FormControl, Button } from '@mui/material'

import { getItems, issueToManager } from '../../../api'

const Issue = ({ manager, proprietor }) => {
    console.log(manager)
    const [issue, setIssue] = useState({ design_number: "", quantity: "" })
    const [items, setItems] = useState([])

    const getItemsData = async () => {
        try {
            const res = await getItems(proprietor.proprietor_id)
            console.log(res.data)
            setItems(res.data)
        }
        catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        console.log("get items")
        console.log(proprietor)
        getItemsData();
    }, [proprietor])

    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await issueToManager(issue, manager.manager_id)
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
                <Select value={issue.design_number} onChange={(e) => { setIssue({ ...issue, design_number: e.target.value }); console.log(issue); }}>
                    {items.map((item) => (
                        <MenuItem value={item.design_number}>{item.design_number}-{item.description}</MenuItem>
                    ))}
                </Select>

                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Quantity</InputLabel>
                    <Input type="number" value={issue.quantity} onChange={(e) => { setIssue({ ...issue, quantity: e.target.value }); console.log(issue); }} />
                </FormControl>
                <Button variant="contained" color="primary" style={{ width: "100px", marginLeft: "100px", marginTop: "10px" }} onClick={onSubmit}
                    disabled={issue.design_number === "" || issue.quantity === "" || issue.quantity === "0"}>Issue</Button>
            </FormGroup>

        </div>
    )
}


export default Issue;