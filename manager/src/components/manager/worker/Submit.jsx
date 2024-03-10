import React, { useEffect, useState } from 'react'
import { FormGroup, Select, MenuItem, InputLabel, Input, FormControl, Button, Typography, TextField } from '@mui/material'

import { getItemsForSubmit, submitFromWorker, getPricesForSubmit } from '../../../api'

const Submit = ({ worker, manager }) => {
    console.log(worker)
    const [submission, setSubmission] = useState({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_proprietor: "", remarks: "", underprocessing_value: "" })
    const [items, setItems] = useState([])
    const [itemIndex, setItemIndex] = useState("")
    // const [prices, setPrices] = useState([])
    const [max, setMax] = useState(0)

    const [open, setOpen] = useState(false)

    const getItemsData = async (worker_id) => {
        try {
            const res = await getItemsForSubmit(worker_id)
            console.log(res.data)

            let i = 0;
            const itemsData = res.data.map((item) => {
                return { ...item, index: i++ }
            })
            setItems(itemsData)
            setItemIndex("")


        }
        catch (err) {
            console.log(err)
        }
    }

    const onItemSelect = async (e) => {

        try {
            // const res = await getPricesForSubmit(worker.worker_id, e.target.value)
            // console.log(res.data)

            setSubmission({
                ...submission,
                design_number: items[e.target.value].design_number,
                quantity: "",
                price: items[e.target.value].price,
                deduction: "",
                underprocessing_value: items[e.target.value].underprocessing_value,
                remarks_from_proprietor: items[e.target.value].remarks_from_proprietor,
                remarks: ""
            })

            setMax(items[e.target.value].quantity)

            setItemIndex(e.target.value)

            // setPrices(res.data)
            console.log(submission);
        }
        catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        console.log("get items")
        console.log(manager)
        getItemsData(worker.worker_id);
        // setPrices([])
        setSubmission({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_proprietor: "", remarks: "", underprocessing_value: "" })
        setItemIndex("")
    }, [worker])

    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await submitFromWorker(submission, worker.worker_id)
            console.log(res.data)

            setSubmission({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_proprietor: "", remarks: "", underprocessing_value: "" })
            await getItemsData(worker.worker_id);
        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        <div>
            <FormGroup style={{ width: "500px", padding: "20px" }}>
                {/* <FormControl style={{ padding: "15px" }}> */}
                <InputLabel>Item</InputLabel>
                <Select value={itemIndex} onChange={onItemSelect} onOpen={() => { setOpen(true) }} onClose={() => { setOpen(false) }}>
                    {items.map((item) => (
                        <MenuItem value={item.index}>{item.design_number}-{item.description}{open ? `, Price: ${item.price}, Quantity Available: ${item.quantity}${item.remarks_from_proprietor !== "" ? ", Remarks: " + item.remarks_from_proprietor : ""}` : ""}</MenuItem>
                    ))}
                </Select>
                {/* </FormControl> */}


                {/* <FormControl style={{ padding: "15px" }}> */}
                {/* <InputLabel>Price</InputLabel>
                <Select value={submission.price} onChange={(e) => { setSubmission({ ...submission, price: e.target.value }); console.log(submission); setMax(prices[prices.findIndex((p) => p.price === e.target.value)].quantity); console.log(max) }}>
                    {
                        prices.map((p) => {
                            return (
                                <MenuItem value={p.price} index>{p.price}</MenuItem>
                            )

                        })
                    }
                </Select> */}
                {/* </FormControl> */}
                <Typography>Price: {itemIndex !== "" && items[itemIndex].price}</Typography>
                <Typography>Underprocessing Value: {itemIndex !== "" && items[itemIndex].underprocessing_value}</Typography>
                <Typography>Remarks From Proprietor: {itemIndex !== "" && items[itemIndex].remarks_from_proprietor}</Typography>
                <Typography style={{ marginTop: "20px" }}>Quantity Available: {itemIndex !== "" && items[itemIndex].quantity}</Typography>
                <FormControl style={{ marginTop: "10px" }}>

                    <InputLabel>Quantity</InputLabel>
                    <Input disabled={submission.price === ""} inputProps={{ min: 1, max: max }} type="number" value={submission.quantity}
                        onChange={(e) => { setSubmission({ ...submission, quantity: e.target.value }); console.log(submission); }}
                        onWheel={(e) => { e.target.blur(); }}
                    />
                </FormControl>

                <FormControl style={{ marginTop: "25px" }}>
                    <InputLabel>Deduction</InputLabel>
                    <Input disabled={submission.price === ""} inputProps={{ min: 0 }} type="number" value={submission.deduction} onChange={(e) => { setSubmission({ ...submission, deduction: e.target.value }); console.log(submission); }} />
                </FormControl>

                <FormControl style={{ marginTop: "15px" }}>
                    <InputLabel>Remarks</InputLabel>
                    <Input disabled={submission.price === ""} value={submission.remarks} onChange={(e) => { setSubmission({ ...submission, remarks: e.target.value }); console.log(submission); }} />
                </FormControl>


                <Button variant="contained" color="primary" style={{ width: "100px", marginLeft: "100px", marginTop: "10px" }} onClick={onSubmit}
                    disabled={submission.design_number === "" || submission.quantity === "" || submission.quantity === "0"
                        || submission.quantity > max
                        || ((submission.deduction !== "0" && submission.deduction !== "") && submission.remarks === "")}>Submit</Button>
            </FormGroup>

        </div>
    )
}


export default Submit;