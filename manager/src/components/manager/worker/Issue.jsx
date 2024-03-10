import React, { useEffect, useState } from 'react'
import { FormGroup, Select, MenuItem, InputLabel, Input, FormControl, Button, Typography } from '@mui/material'

import { getItemsForIssue, issueToWorker, getPriceForIssue } from '../../../api'



const Issue = ({ worker, manager }) => {
    console.log(worker)
    const [issue, setIssue] = useState({ design_number: "", quantity: "", price: "", underprocessing_value: "", thread_raw_material: "", remarks: "" })
    const [items, setItems] = useState([])
    const [itemIndex, setItemIndex] = useState("")
    const [max, setMax] = useState(0)

    const [open, setOpen] = useState(false);


    const getItemsData = async () => {
        try {
            const res = await getItemsForIssue(manager.manager_id)
            console.log(res.data)
            let i = 0;
            const itemsData = res.data.map((item) => {
                return { ...item, index: i++ }
            })
            setItems(itemsData)
            setIssue({ design_number: "", quantity: "", price: "", underprocessing_value: "", thread_raw_material: "", remarks: "" })
            setItemIndex("")
        }
        catch (err) {
            console.log(err)
        }
    }

    const onItemSelect = async (e) => {

        try {
            setItemIndex(e.target.value)

            const res = await getPriceForIssue(worker.worker_id, items[e.target.value].design_number)
            console.log(res.data)


            setIssue({
                ...issue,
                price: res.data.price,
                design_number: items[e.target.value].design_number,
                quantity: "",
                underprocessing_value: items[e.target.value].underprocessing_value,
                thread_raw_material: "",
                remarks: items[e.target.value].remarks_from_proprietor
            })
            console.log(issue);
            setMax(items[e.target.value].quantity)
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

            await getItemsData();
        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        <div>
            <FormGroup style={{ width: "500px", padding: "20px" }}>
                <InputLabel>Item</InputLabel>
                <Select value={itemIndex} onChange={onItemSelect} onOpen={() => { setOpen(true); }} onClose={() => { setOpen(false) }}>
                    {items.map((item) => (
                        <MenuItem value={item.index}>{item.design_number}-{item.description}{open ? `, Quantity Available: ${item.quantity}, Thread/Raw Material Available-${item.thread_raw_material}${item.remarks_from_proprietor !== "" ? ", Remarks: " + item.remarks_from_proprietor : ""}` : ""}</MenuItem>
                    ))}
                </Select>
                <Typography>Price: {issue.price}</Typography>
                <Typography>Underprocessing Value: {issue.underprocessing_value}</Typography>
                <Typography style={{ marginTop: "25px" }}>Quantity Available: {itemIndex !== "" && items[itemIndex].quantity}</Typography>
                <FormControl style={{ marginTop: "20px" }}>
                    <InputLabel>Quantity</InputLabel>
                    <Input disabled={issue.design_number === ""} inputProps={{ min: 1, max: max }} type="number" value={issue.quantity}
                        onChange={(e) => { setIssue({ ...issue, quantity: e.target.value }); console.log(issue); }}
                        onWheel={(e) => { e.target.blur(); }}
                    />
                </FormControl>
                <Typography style={{ marginTop: "25px" }}>Thread/Raw Material Available: {itemIndex !== "" && items[itemIndex].thread_raw_material}</Typography>
                <FormControl style={{ marginTop: "20px" }}>
                    <InputLabel>Thread Raw Material</InputLabel>
                    <Input value={issue.thread_raw_material} onChange={(e) => { setIssue({ ...issue, thread_raw_material: e.target.value }); console.log(issue); }} />
                </FormControl>

                <Typography>Remarks from Proprietor: {issue.remarks}</Typography>
                <Button variant="contained" color="primary" style={{ width: "100px", marginLeft: "100px", marginTop: "10px" }} onClick={onSubmit}
                    disabled={issue.design_number === "" || issue.quantity === "" || issue.quantity === "0" ||
                        issue.underprocessing_value === "" || issue.underprocessing_value === "0" ||
                        issue.quantity > max || issue.thread_raw_material === ""}>Issue</Button>
            </FormGroup>

        </div>
    )
}


export default Issue;