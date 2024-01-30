import React, { useEffect, useState } from 'react'
import { FormGroup, Select, MenuItem, InputLabel, Input, FormControl, Button, Typography } from '@mui/material'

import { getItems, issueToWorker, getPrice } from '../../../api'

const Issue = ({ worker, manager }) => {
    console.log(worker)
    const [issue, setIssue] = useState({ design_number: "", quantity: "", price: "" })
    const [items, setItems] = useState([])
    const [item, setItem] = useState({ design_number: "", description: "" })


    const getItemsData = async () => {
        try {
            const res = await getItems(manager.manager_id)
            console.log(res.data)
            setItems(res.data)
        }
        catch (err) {
            console.log(err)
        }
    }

    const onItemSelect = async (e) => {

        try {
            const res = await getPrice(worker.worker_id, e.target.value)
            console.log(res.data)

            setIssue({ ...issue, price: res.data.price, design_number: e.target.value })
            console.log(issue);
        }
        catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        console.log("get items")
        console.log(manager)
        getItemsData();
    }, [manager])

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
                    <Input type="number" value={issue.quantity} onChange={(e) => { setIssue({ ...issue, quantity: e.target.value }); console.log(issue); }} />
                </FormControl>
                <Button variant="contained" color="primary" style={{ width: "100px", marginLeft: "100px", marginTop: "10px" }} onClick={onSubmit}
                    disabled={issue.design_number === "" || issue.quantity === "" || issue.quantity === "0"}>Issue</Button>
            </FormGroup>

        </div>
    )
}


export default Issue;