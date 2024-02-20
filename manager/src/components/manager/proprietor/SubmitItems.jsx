import React, { useState, useEffect } from 'react'
import { FormGroup, Select, MenuItem, InputLabel, Input, FormControl, Button, Typography } from '@mui/material'

import { getItemsForFinalSubmit, submitToProprietor, getPricesForFinalSubmit } from '../../../api'

const SubmitItems = ({ manager }) => {
    console.log(manager)

    const [submission, setSubmission] = useState({ design_number: "", quantity: "", price: "", deduction: "", remarks: "" })
    const [items, setItems] = useState([])
    const [prices, setPrices] = useState([])
    const [max, setMax] = useState(0)

    const [open, setOpen] = useState(false)

    const getItemsData = async () => {
        try {
            const res = await getItemsForFinalSubmit(manager.manager_id)
            console.log(res.data)
            setItems(res.data)
        }
        catch (err) {
            console.log(err)
        }
    }


    const onItemSelect = async (e) => {
        try {
            const res = await getPricesForFinalSubmit(manager.manager_id, e.target.value)
            console.log(res.data)
            setPrices(res.data)
            setSubmission({ ...submission, design_number: e.target.value, quantity: "", price: "", deduction: "", remarks: "" })
            console.log(submission);

        }
        catch (err) {
            console.log(err)
        }
    }

    const onPriceSelect = (e) => {
        const chosenPrice = JSON.parse(e.target.value)
        setSubmission({ ...submission, quantity: "", price: chosenPrice.price, deduction: chosenPrice.deduction, remarks: chosenPrice.remarks })
        setMax(chosenPrice.quantity)
        console.log(max)
    }

    useEffect(() => {
        console.log("get items")
        console.log(manager)
        getItemsData();
    }, [manager])



    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await submitToProprietor(submission, manager.manager_id)
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

                <InputLabel>Design Number</InputLabel>
                <Select value={submission.design_number} onChange={onItemSelect}>
                    {items.map((item) => (
                        <MenuItem value={item.design_number}>{item.design_number}-{item.description}</MenuItem>
                    ))}
                </Select>

                <InputLabel>Price</InputLabel>
                <Select value={JSON.stringify({ quantity: max, price: submission.price, deduction: submission.deduction, remarks: submission.remarks })}
                    onChange={onPriceSelect} onOpen={() => { setOpen(true) }} onClose={() => { setOpen(false) }}>
                    {
                        prices.map((p) => {
                            return (
                                <MenuItem value={JSON.stringify(p)}>{open ? `Price: ${p.price}, Deduction: ${p.deduction ? p.deduction : ""}, Remarks: ${p.remarks}, Quantity Available: ${p.quantity}` : p.price}</MenuItem>
                            )
                        })
                    }


                </Select>
                <Typography>Deduction: {submission.deduction}</Typography>
                <Typography>Remarks: {submission.remarks}</Typography>

                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Quantity</InputLabel>
                    <Input disabled={submission.design_number === ""} type="number" inputProps={{ min: 1, max: max }} value={submission.quantity} onChange={(e) => setSubmission({ ...submission, quantity: e.target.value })} />
                </FormControl>
                <Button variant="contained" color="primary" onClick={onSubmit} style={{ width: "100px", marginLeft: "100px" }}
                    disabled={submission.design_number === "" || submission.quantity === "" || submission.quantity === "0" ||
                        submission.price === ""}>Submit</Button>
            </FormGroup>
        </div>
    )
}

export default SubmitItems