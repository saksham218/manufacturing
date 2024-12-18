import React, { useEffect, useState } from 'react'
import { FormGroup, Select, MenuItem, InputLabel, Input, FormControl, Button, Typography, TextField } from '@mui/material'

import { getItemsForSubmit, submitFromWorker } from '../../../api'
import { useWorker } from './workerContext/WorkerContext'

const Submit = ({ manager }) => {

    const { worker } = useWorker()
    console.log(worker)
    const [submission, setSubmission] = useState({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_proprietor: "", remarks: "", underprocessing_value: "" })
    const [items, setItems] = useState([])
    const [itemIndex, setItemIndex] = useState("")
    // const [prices, setPrices] = useState([])
    const [maxQuantity, setMaxQuantity] = useState(0)

    const [maxDeduction, setMaxDeduction] = useState(0)

    const [open, setOpen] = useState(false)

    const getItemsData = async (worker_id) => {
        try {
            const res = await getItemsForSubmit(worker_id)
            console.log(res.data)

            let i = 0;
            const itemsData = res.data.map((item) => {
                return { ...item, index: i++ }
            })

            return itemsData;

        }
        catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {

        let isMounted = true;

        if (worker) {
            console.log("get items")
            console.log(manager)
            setItems([])
            setItemIndex("")
            setSubmission({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_proprietor: "", remarks: "", underprocessing_value: "" })
            getItemsData(worker.worker_id).then((itemsData) => {

                if (isMounted) {
                    setItems(itemsData)
                }

            });
            // setPrices([])
        }

        return () => { isMounted = false }
    }, [worker])

    useEffect(() => {

        let isMounted = true;


        if (itemIndex !== "" && items.length > 0 && isMounted) {
            setSubmission({
                ...submission,
                design_number: items[itemIndex].design_number,
                quantity: "",
                price: items[itemIndex].price,
                deduction: "",
                underprocessing_value: items[itemIndex].underprocessing_value,
                remarks_from_proprietor: items[itemIndex].remarks_from_proprietor,
                remarks: ""
            })

            setMaxQuantity(items[itemIndex].quantity)

            setMaxDeduction(items[itemIndex].price)
        }

        console.log(submission);

        return () => { isMounted = false }

    }, [itemIndex, items])



    const onItemSelect = async (e) => {
        console.log("selected item index: ", e.target.value)
        setItemIndex(e.target.value)
    }


    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await submitFromWorker(submission, worker.worker_id)
            console.log(res.data)

            setSubmission({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_proprietor: "", remarks: "", underprocessing_value: "" })
            const itemsData = await getItemsData(worker.worker_id);
            setItems(itemsData);
            setItemIndex("");
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
                    {items?.map((item) => (
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
                    <Input disabled={submission.price === ""} inputProps={{ min: 1, max: maxQuantity }} type="number" value={submission.quantity}
                        onChange={(e) => { setSubmission({ ...submission, quantity: e.target.value }); console.log(submission); }}
                        onWheel={(e) => { e.target.blur(); }}
                    />
                </FormControl>

                <FormControl style={{ marginTop: "25px" }}>
                    <InputLabel>Deduction</InputLabel>
                    <Input disabled={submission.price === ""} inputProps={{ min: 0, max: maxDeduction }} type="number" value={submission.deduction} onChange={(e) => { setSubmission({ ...submission, deduction: e.target.value }); console.log(submission); }} onWheel={(e) => { e.target.blur(); }} />
                </FormControl>

                <FormControl style={{ marginTop: "15px" }}>
                    <InputLabel>Remarks</InputLabel>
                    <Input disabled={submission.price === ""} value={submission.remarks} onChange={(e) => { setSubmission({ ...submission, remarks: e.target.value }); console.log(submission); }} />
                </FormControl>


                <Button variant="contained" color="primary" style={{ width: "100px", marginLeft: "100px", marginTop: "10px" }} onClick={onSubmit}
                    disabled={submission.design_number === "" || submission.quantity === "" || submission.quantity === "0"
                        || submission.quantity > maxQuantity || submission.deduction > maxDeduction
                        || ((submission.deduction !== "0" && submission.deduction !== "") && submission.remarks === "")}>Submit</Button>
            </FormGroup>

        </div>
    )
}


export default Submit;