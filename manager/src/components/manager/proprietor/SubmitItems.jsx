import React, { useState, useEffect } from 'react'
import { FormGroup, Select, MenuItem, InputLabel, Input, FormControl, Button, Typography } from '@mui/material'

import { getItemsForFinalSubmit, submitToProprietor, getPricesForFinalSubmit } from '../../../api'

const SubmitItems = ({ manager }) => {
    console.log(manager)

    const [submission, setSubmission] = useState({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_manager: "", remarks_from_proprietor: "", underprocessing_value: "" })
    const [items, setItems] = useState([])
    const [itemIndex, setItemIndex] = useState("")
    // const [prices, setPrices] = useState([])
    const [max, setMax] = useState(0)

    const [open, setOpen] = useState(false)

    const getItemsData = async () => {
        try {
            const res = await getItemsForFinalSubmit(manager.manager_id)
            console.log(res.data)

            let i = 0;
            const itemsData = res.data.map((item) => {
                return { ...item, index: i++ }
            })
            setItems(itemsData)
            setSubmission({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_manager: "", remarks_from_proprietor: "", underprocessing_value: "" })
            setItemIndex("")
        }
        catch (err) {
            console.log(err)
        }
    }


    const onItemSelect = async (e) => {
        try {
            // const res = await getPricesForFinalSubmit(manager.manager_id, e.target.value)
            // console.log(res.data)
            // setPrices(res.data)
            setSubmission({
                ...submission,
                design_number: items[e.target.value].design_number,
                quantity: "",
                price: items[e.target.value].price,
                deduction: items[e.target.value].deduction,
                remarks_from_manager: items[e.target.value].remarks_from_manager,
                remarks_from_proprietor: items[e.target.value].remarks_from_proprietor,
                underprocessing_value: items[e.target.value].underprocessing_value,
            })
            console.log(submission);

            setMax(items[e.target.value].quantity)
            setItemIndex(e.target.value)


        }
        catch (err) {
            console.log(err)
        }
    }

    // const onPriceSelect = (e) => {
    //     const chosenPrice = JSON.parse(e.target.value)
    //     setSubmission({ ...submission, quantity: "", price: chosenPrice.price, deduction: chosenPrice.deduction, remarks: chosenPrice.remarks })
    //     setMax(chosenPrice.quantity)
    //     console.log(max)
    // }

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

            setSubmission({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_manager: "", remarks_from_proprietor: "", underprocessing_value: "" })
            setItemIndex("")
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
                <Select value={itemIndex} onChange={onItemSelect} onOpen={() => { setOpen(true) }} onClose={() => { setOpen(false) }}>
                    {items.map((item) => (
                        <MenuItem value={item.index}>{item.design_number}-{item.description}{open ? `, Price: ${item.price}, Quantity Available: ${item.quantity}${item.remarks_from_manager !== "" ? ", Remarks from manager: " + item.remarks_from_manager : ""}${item.remarks_from_proprietor !== "" ? ", Remarks from proprietor: " + item.remarks_from_proprietor : ""}` : ""}</MenuItem>
                    ))}
                </Select>

                {/* <InputLabel>Price</InputLabel>
                <Select value={JSON.stringify({ quantity: max, price: submission.price, deduction: submission.deduction, remarks: submission.remarks })}
                    onChange={onPriceSelect} onOpen={() => { setOpen(true) }} onClose={() => { setOpen(false) }}>
                    {
                        prices.map((p) => {
                            return (
                                <MenuItem value={JSON.stringify(p)}>{open ? `Price: ${p.price}, Deduction: ${p.deduction ? p.deduction : ""}, Remarks: ${p.remarks}, Quantity Available: ${p.quantity}` : p.price}</MenuItem>
                            )
                        })
                    }


                </Select> */}
                <Typography>Price: {itemIndex !== "" && items[itemIndex].price}</Typography>
                <Typography>Deduction: {itemIndex !== "" && items[itemIndex].deduction}</Typography>
                <Typography>Remarks From Manager: {itemIndex !== "" && items[itemIndex].remarks_from_manager}</Typography>

                <Typography style={{ marginTop: "20px" }}>Quantity Available: {itemIndex !== "" && items[itemIndex].quantity}</Typography>

                <FormControl style={{ marginTop: "10px" }}>
                    <InputLabel>Quantity</InputLabel>
                    <Input disabled={submission.design_number === ""} type="number" inputProps={{ min: 1, max: max }} value={submission.quantity} onChange={(e) => setSubmission({ ...submission, quantity: e.target.value })} />
                </FormControl>
                <Typography style={{ marginTop: "15px" }}>Underprocessing Value: {itemIndex !== "" && items[itemIndex].underprocessing_value}</Typography>
                <Typography>Remarks From Proprietor: {itemIndex !== "" && items[itemIndex].remarks_from_proprietor}</Typography>
                <Button variant="contained" color="primary" onClick={onSubmit} style={{ width: "100px", marginLeft: "100px", marginTop: "15px" }}
                    disabled={submission.design_number === "" || submission.quantity === "" || submission.quantity === "0" ||
                        submission.price === ""}>Submit</Button>
            </FormGroup>
        </div>
    )
}

export default SubmitItems