import React, { useEffect, useState } from 'react'
import { FormGroup, Select, MenuItem, InputLabel, Input, FormControl, Button, Typography, TextField } from '@mui/material'

import { submitFromWorker, getPricesForSubmitAdhoc, getItems } from '../../../api'
import { useWorker } from './workerContext/WorkerContext'



const SubmitAdhoc = ({ manager }) => {

    const { worker } = useWorker()
    console.log(worker)
    const [submission, setSubmission] = useState({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_proprietor: "", remarks: "", underprocessing_value: "", is_adhoc: true })
    const [items, setItems] = useState([])
    const [itemIndex, setItemIndex] = useState("")
    // const [prices, setPrices] = useState([])

    const [maxDeduction, setMaxDeduction] = useState(0)

    const [currentWorkerPrice, setCurrentWorkerPrice] = useState("")


    const getItemsData = async (proprietor_id) => {
        try {
            const res = await getItems(proprietor_id)
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

    useEffect(() => {

        let isMounted = true;
        console.log("get items")
        console.log(manager)
        setSubmission({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_proprietor: "", remarks: "", underprocessing_value: "", is_adhoc: true })
        setMaxDeduction(0)
        setItemIndex("")
        setCurrentWorkerPrice("")
        getItemsData(manager.proprietor_id).then((itemsData) => {

            if (isMounted) {
                setItems(itemsData)
            }
        });
        // setPrices([])

        return () => { isMounted = false }

    }, [worker, manager])

    useEffect(() => {

        let isMounted = true;

        if (itemIndex !== "" && items.length > 0) {

            setSubmission({
                ...submission,
                design_number: items[itemIndex].design_number,
                quantity: "",
                price: "",
                deduction: "",
                underprocessing_value: "",
                remarks_from_proprietor: "",
                remarks: "",
                is_adhoc: true
            })

            getPrices(worker.worker_id, items[itemIndex].design_number).then((pricesData) => {
                console.log(pricesData)

                if (isMounted) {
                    setCurrentWorkerPrice(pricesData.price)
                }

            })
        }

        return () => { isMounted = false }


    }, [items, itemIndex])

    const onItemSelect = async (e) => {

        setItemIndex(e.target.value)

        // setPrices(res.data)
        console.log(submission);

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
            console.log(res.price)

            setSubmission({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_proprietor: "", remarks: "", underprocessing_value: "", is_adhoc: true })
            setItemIndex("")
            setCurrentWorkerPrice("")


        }
        catch (err) {
            console.log(err)
        }
        // console.log(submission)
    }

    return (
        <div>
            <FormGroup style={{ width: "500px", padding: "20px" }}>
                {/* <FormControl style={{ padding: "15px" }}> */}
                <InputLabel>Item</InputLabel>
                <Select value={itemIndex} onChange={onItemSelect}>
                    {items.map((item) => (
                        <MenuItem value={item.index}>{item.design_number}-{item.description}</MenuItem>
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
                <Typography>Current Price: {currentWorkerPrice}</Typography>

                <FormControl style={{ marginTop: "10px" }}>
                    <InputLabel>Price</InputLabel>
                    <Input disabled={submission.design_number === ""} inputProps={{ min: 0 }} type="number" value={submission.price} onChange={onPriceChange} onWheel={(e) => { e.target.blur(); }} />
                </FormControl>


                <FormControl style={{ marginTop: "10px" }}>

                    <InputLabel>Quantity</InputLabel>
                    <Input inputProps={{ min: 1 }} type="number" value={submission.quantity}
                        disabled={submission.design_number === ""}
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
                {/* <Typography>Underprocessing Value: {itemIndex !== "" && items[itemIndex].underprocessing_value}</Typography>
                <Typography>Remarks From Proprietor: {itemIndex !== "" && items[itemIndex].remarks_from_proprietor}</Typography> */}

                <FormControl style={{ marginTop: "15px" }}>
                    <InputLabel>Underprocessing Value</InputLabel>
                    <Input disabled={submission.price === ""} type="number" value={submission.underprocessing_value} onChange={(e) => { setSubmission({ ...submission, underprocessing_value: e.target.value }) }} />
                </FormControl>

                <FormControl style={{ marginTop: "15px" }}>
                    <InputLabel>Remarks From Proprietor</InputLabel>
                    <Input disabled={submission.price === ""} value={submission.remarks_from_proprietor} onChange={(e) => { setSubmission({ ...submission, remarks_from_proprietor: e.target.value }) }} />
                </FormControl>




                <Button variant="contained" color="primary" style={{ width: "150px", marginLeft: "100px", marginTop: "10px" }} onClick={onSubmit}
                    disabled={submission.design_number === "" || submission.quantity === "" || submission.quantity === "0"
                        || submission.deduction > maxDeduction
                        || ((submission.deduction !== "0" && submission.deduction !== "") && submission.remarks === "")}>Submit Adhoc</Button>
            </FormGroup>

        </div>
    )
}


export default SubmitAdhoc;