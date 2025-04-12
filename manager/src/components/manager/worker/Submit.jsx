import React, { useEffect, useState } from 'react'
import { FormGroup, Select, MenuItem, InputLabel, Input, FormControl, Button, Typography, TextField, FormControlLabel, Checkbox, Box } from '@mui/material'

import { getItemsForSubmit, getItems, submitFromWorker, getPricesForSubmitAdhoc } from '../../../api'
import { useWorker } from './workerContext/WorkerContext'

const getItemsData = async (proprietor_id, worker_id, isAdhoc) => {
    try {

        let res;
        if (isAdhoc) {
            res = await getItems(proprietor_id)
        }
        else {
            res = await getItemsForSubmit(worker_id)
        }
        console.log(res.data)

        let i = 0;
        const itemsData = res.data.map((item) => {
            return { ...item, index: i++ }
        })

        console.log(itemsData)
        return itemsData;

    }
    catch (err) {
        console.log(err)
    }
}

const getPrices = async (worker_id, design_number) => {
    try {
        const res = await getPricesForSubmitAdhoc(worker_id, design_number)
        console.log(res.data)
        return res.data
    }
    catch (err) {
        console.log(err)
    }
}

const Submit = ({ manager }) => {

    const { worker } = useWorker()
    console.log(worker)
    const [submission, setSubmission] = useState({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_proprietor: "", remarks: "", underprocessing_value: "" })
    const [items, setItems] = useState([])
    const [itemIndex, setItemIndex] = useState("")
    const [isAdhoc, setIsAdhoc] = useState(false)
    const [toHold, setToHold] = useState(false)
    // const [prices, setPrices] = useState([])
    const [maxQuantity, setMaxQuantity] = useState(0)

    const [maxDeduction, setMaxDeduction] = useState(0)

    const [currentWorkerPrice, setCurrentWorkerPrice] = useState("")

    const [open, setOpen] = useState(false)

    useEffect(() => {

        let isMounted = true;

        if (worker) {
            console.log("get items")
            console.log(manager)
            setItems([])
            setItemIndex("")
            setMaxQuantity(0)
            setMaxDeduction(0)
            setCurrentWorkerPrice("")
            setSubmission({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_proprietor: "", remarks: "", underprocessing_value: "", is_adhoc: isAdhoc })
            getItemsData(manager.proprietor_id, worker.worker_id, isAdhoc).then((itemsData) => {

                if (isMounted) {
                    setItems(itemsData)
                }

            });
            // setPrices([])
        }

        return () => { isMounted = false }
    }, [worker, isAdhoc])

    useEffect(() => {

        let isMounted = true;


        if (itemIndex !== "" && items.length > 0) {

            if (isAdhoc) {
                setSubmission({
                    ...submission,
                    design_number: items[itemIndex].design_number,
                    quantity: "",
                    price: "",
                    deduction: "",
                    underprocessing_value: "",
                    remarks_from_proprietor: "",
                    remarks: "",
                    is_adhoc: isAdhoc
                })

                setMaxQuantity(Infinity)

                getPrices(worker.worker_id, items[itemIndex].design_number).then((pricesData) => {
                    console.log(pricesData)

                    if (isMounted) {
                        setCurrentWorkerPrice(pricesData.price)
                    }

                })
            }
            else {
                if (isMounted) {
                    setSubmission({
                        ...submission,
                        design_number: items[itemIndex].design_number,
                        quantity: "",
                        price: items[itemIndex].price,
                        deduction: "",
                        underprocessing_value: items[itemIndex].underprocessing_value,
                        remarks_from_proprietor: items[itemIndex].remarks_from_proprietor,
                        remarks: "",
                        is_adhoc: isAdhoc
                    })

                    setMaxQuantity(items[itemIndex].quantity)

                    setMaxDeduction(items[itemIndex].price)
                }
            }
        }

        console.log(submission);

        return () => { isMounted = false }

    }, [itemIndex, items, isAdhoc])


    const onItemSelect = async (e) => {
        console.log("selected item index: ", e.target.value)
        setItemIndex(e.target.value)
    }

    const onPriceChange = (e) => {

        console.log(e.target.value)
        setSubmission({
            ...submission,
            price: Number(e.target.value)
        })
        setMaxDeduction(Number(e.target.value))
    }


    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await submitFromWorker(submission, worker.worker_id)
            console.log(res.data)

            setSubmission({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_proprietor: "", remarks: "", underprocessing_value: "", is_adhoc: isAdhoc })
            const itemsData = await getItemsData(manager.proprietor_id, worker.worker_id, isAdhoc);
            setItems(itemsData);
            setItemIndex("");
            setCurrentWorkerPrice("");
        }
        catch (err) {
            console.log(err)
        }
    }

    const onIsAdhocChange = (e) => {
        setIsAdhoc(e.target.checked);
    }


    return (
        <div>
            <FormGroup style={{ width: "750px", padding: "20px" }}>
                {/* <FormControl style={{ padding: "15px" }}> */}
                <div style={{ display: 'flex' }}>
                    <Box style={{ width: "400px", marginRight: "20px" }}>
                        <InputLabel>Item</InputLabel>
                        <Select style={{ width: "400px" }} value={itemIndex} onChange={onItemSelect} onOpen={() => { setOpen(true) }} onClose={() => { setOpen(false) }}>
                            {items?.map((item) => (
                                isAdhoc ?
                                    <MenuItem value={item.index} > {item.design_number} - {item.description}</MenuItem>
                                    :
                                    <MenuItem value={item.index}>{item.design_number}-{item.description}{open ? `, Price: ${item.price}, Quantity Available: ${item.quantity}${item.remarks_from_proprietor !== "" ? ", Remarks: " + item.remarks_from_proprietor : ""}` : ""}</MenuItem>

                            ))}
                        </Select>
                    </Box>

                    <FormControlLabel control={<Checkbox checked={isAdhoc} onChange={onIsAdhocChange} />} label="Submit Adhoc" />
                </div>

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
                {isAdhoc && <Typography>Current Price: {currentWorkerPrice}</Typography>}
                {isAdhoc ?
                    <FormControl style={{ marginTop: "10px" }}>
                        <InputLabel>Price</InputLabel>
                        <Input disabled={submission.design_number === ""} inputProps={{ min: 0 }} type="number" value={submission.price} onChange={onPriceChange} onWheel={(e) => { e.target.blur(); }} />
                    </FormControl>
                    :
                    <Typography>Price: {itemIndex !== "" && items[itemIndex].price}</Typography>
                }

                {!isAdhoc &&
                    <>
                        <Typography>Underprocessing Value: {itemIndex !== "" && items[itemIndex].underprocessing_value}</Typography>
                        <Typography>Remarks From Proprietor: {itemIndex !== "" && items[itemIndex].remarks_from_proprietor}</Typography>
                        <Typography style={{ marginTop: "20px" }}>Quantity Available: {itemIndex !== "" && items[itemIndex].quantity}</Typography>
                    </>
                }

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

                {isAdhoc &&
                    <>
                        <FormControl style={{ marginTop: "15px" }}>
                            <InputLabel>Underprocessing Value</InputLabel>
                            <Input disabled={submission.price === ""} type="number" value={submission.underprocessing_value} onChange={(e) => { setSubmission({ ...submission, underprocessing_value: e.target.value }) }} />
                        </FormControl>

                        <FormControl style={{ marginTop: "15px" }}>
                            <InputLabel>Remarks From Proprietor</InputLabel>
                            <Input disabled={submission.price === ""} value={submission.remarks_from_proprietor} onChange={(e) => { setSubmission({ ...submission, remarks_from_proprietor: e.target.value }) }} />
                        </FormControl>
                    </>
                }


                <Button variant="contained" color="primary" style={{ width: "100px", marginLeft: "100px", marginTop: "10px" }} onClick={onSubmit}
                    disabled={submission.design_number === "" || submission.quantity === "" || submission.quantity === "0"
                        || submission.quantity > maxQuantity || submission.deduction > maxDeduction
                        || ((submission.deduction !== "0" && submission.deduction !== "") && submission.remarks === "")}>Submit</Button>
            </FormGroup>

        </div >
    )
}


export default Submit;