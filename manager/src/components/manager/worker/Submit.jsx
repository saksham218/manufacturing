import React, { useEffect, useState } from 'react'
import { FormGroup, Select, MenuItem, InputLabel, Input, FormControl, Button, Typography, TextField } from '@mui/material'

import { getItemsForSubmit, submitFromWorker, getPricesForSubmit } from '../../../api'

const Submit = ({ worker, manager }) => {
    console.log(worker)
    const [submission, setSubmission] = useState({ design_number: "", quantity: "", price: "", deduction: "", remarks: "" })
    const [items, setItems] = useState([])
    const [prices, setPrices] = useState([])
    const [max, setMax] = useState(0)

    const getItemsData = async (worker_id) => {
        try {
            const res = await getItemsForSubmit(worker_id)
            console.log(res.data)
            setItems(res.data)

        }
        catch (err) {
            console.log(err)
        }
    }

    const onItemSelect = async (e) => {

        try {
            const res = await getPricesForSubmit(worker.worker_id, e.target.value)
            console.log(res.data)

            setSubmission({ ...submission, design_number: e.target.value, price: "" })
            setPrices(res.data)
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
        setPrices([])
        setSubmission({ design_number: "", quantity: "", price: "", deduction: "", remarks: "" })
    }, [worker])

    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await submitFromWorker(submission, worker.worker_id)
            console.log(res.data)

            setSubmission({ design_number: "", quantity: "", price: "", deduction: "", remarks: "" })
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
                <Select value={submission.design_number} onChange={onItemSelect}>
                    {items.map((item) => (
                        <MenuItem value={item.design_number}>{item.design_number}-{item.description}</MenuItem>
                    ))}
                </Select>
                {/* </FormControl> */}


                {/* <FormControl style={{ padding: "15px" }}> */}
                <InputLabel>Price</InputLabel>
                <Select value={submission.price} onChange={(e) => { setSubmission({ ...submission, price: e.target.value }); console.log(submission); setMax(prices[prices.findIndex((p) => p.price === e.target.value)].quantity); console.log(max) }}>
                    {
                        prices.map((p) => {
                            return (
                                <MenuItem value={p.price} index>{p.price}</MenuItem>
                            )

                        })
                    }
                </Select>
                {/* </FormControl> */}
                {/* <FormControl style={{ padding: "15px" }}> */}
                <InputLabel>Quantity</InputLabel>
                <Input disabled={submission.price === ""} inputProps={{ min: 1, max: max }} type="number" value={submission.quantity} onChange={(e) => { setSubmission({ ...submission, quantity: e.target.value }); console.log(submission); }} />
                {/* </FormControl> */}

                {/* <FormControl style={{ padding: "15px" }}> */}
                <InputLabel>Deduction</InputLabel>
                <Input inputProps={{ min: 0 }} type="number" value={submission.deduction} onChange={(e) => { setSubmission({ ...submission, deduction: e.target.value }); console.log(submission); }} />
                {/* </FormControl> */}

                {/* <FormControl style={{ padding: "15px" }}> */}
                <InputLabel>Remarks</InputLabel>
                <Input value={submission.remarks} onChange={(e) => { setSubmission({ ...submission, remarks: e.target.value }); console.log(submission); }} />
                {/* </FormControl> */}


                <Button variant="contained" color="primary" style={{ width: "100px", marginLeft: "100px", marginTop: "10px" }} onClick={onSubmit}
                    disabled={submission.design_number === "" || submission.quantity === "" || submission.quantity === "0" || ((submission.deduction !== "0" && submission.deduction !== "") && submission.remarks === "")}>Submit</Button>
            </FormGroup>

        </div>
    )
}


export default Submit;