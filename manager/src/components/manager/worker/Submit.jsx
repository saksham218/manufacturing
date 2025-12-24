import React, { useEffect, useState } from 'react'
import { FormGroup, Select, MenuItem, InputLabel, Input, FormControl, Typography, TextField, FormControlLabel, Checkbox, Box, CircularProgress } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import { getItemsForSubmit, getItems, submitFromWorker, getPricesForSubmitAdhoc } from '../../../api'
import { useWorker } from './workerContext/WorkerContext'
import HoldInfo from '../../layouts/HoldInfo'
import CustomButton from '../../layouts/CustomButton'

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

    const [itemsLoading, setItemsLoading] = useState(false)
    const [priceLoading, setPriceLoading] = useState(false)


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
            setSubmission({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_proprietor: "", remarks: "", underprocessing_value: "", is_adhoc: isAdhoc, to_hold: toHold })
            setItemsLoading(true)
            getItemsData(manager.proprietor_id, worker.worker_id, isAdhoc).then((itemsData) => {

                if (isMounted) {
                    setItems(itemsData)
                    setItemsLoading(false)
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
                setCurrentWorkerPrice("")
                setSubmission({
                    ...submission,
                    design_number: items[itemIndex].design_number,
                    quantity: "",
                    price: "",
                    deduction: "",
                    underprocessing_value: items[itemIndex].underprocessing_value ? items[itemIndex].underprocessing_value : "",
                    remarks_from_proprietor: "",
                    remarks: "",
                    is_adhoc: isAdhoc,
                    to_hold: toHold,
                    submit_from_worker_date: dayjs().format('DD/MM/YYYY'),
                    hold_info: {}
                })
                setMaxQuantity(Infinity)
                setPriceLoading(true)

                getPrices(worker.worker_id, items[itemIndex].design_number).then((pricesData) => {
                    console.log(pricesData)

                    if (isMounted) {
                        setPriceLoading(false)
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
                        is_adhoc: isAdhoc,
                        to_hold: toHold,
                        submit_from_worker_date: undefined,
                        hold_info: items[itemIndex].hold_info
                    })

                    setMaxQuantity(items[itemIndex].quantity)

                    setMaxDeduction(items[itemIndex].price)
                }
            }
        } else {
            setSubmission({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_proprietor: "", remarks: "", underprocessing_value: "", is_adhoc: isAdhoc, to_hold: toHold })
        }

        console.log(submission);

        return () => { isMounted = false }

    }, [itemIndex, items])

    useEffect(() => {
        setSubmission({
            ...submission,
            deduction: "",
            remarks: ""
        })
    }, [toHold])


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


    const onSubmit = async () => {

        const res = await submitFromWorker({ ...submission, is_adhoc: isAdhoc, to_hold: toHold }, worker.worker_id)
        console.log(res.data)

        setSubmission({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_proprietor: "", remarks: "", underprocessing_value: "", is_adhoc: isAdhoc, to_hold: toHold })
        const itemsData = await getItemsData(manager.proprietor_id, worker.worker_id, isAdhoc);
        setItems(itemsData);
        setItemIndex("");
        setCurrentWorkerPrice("");

    }

    return (
        <div>
            <FormGroup style={{ width: "500px", padding: "20px" }}>
                {/* <FormControl style={{ padding: "15px" }}> */}
                <div style={{ display: 'flex' }}>
                    <Box style={{ marginRight: "20px", width: "400px", height: "100px" }}>
                        {itemsLoading ? <CircularProgress style={{ marginLeft: "170px", marginTop: "25px" }} /> :
                            <>
                                <InputLabel>Item</InputLabel>
                                <Select style={{ width: "100%" }} value={itemIndex} onChange={onItemSelect} onOpen={() => { setOpen(true) }} onClose={() => { setOpen(false) }}>
                                    {items?.map((item) => (
                                        isAdhoc ?
                                            <MenuItem value={item.index} > {item.design_number} - {item.description}</MenuItem>
                                            :
                                            <MenuItem value={item.index}>{item.design_number}-{item.description}{open ? `, Price: ${item.price}, Quantity Available: ${item.quantity}${item.remarks_from_proprietor !== "" ? ", Remarks: " + item.remarks_from_proprietor : ""}` : ""}</MenuItem>

                                    ))}
                                </Select>
                            </>
                        }
                    </Box>

                    <FormControlLabel control={<Checkbox checked={isAdhoc} onChange={(e) => { setIsAdhoc(e.target.checked) }} />} label="Submit Adhoc" />
                    <FormControlLabel control={<Checkbox checked={toHold} onChange={(e) => { setToHold(e.target.checked) }} />} label="To Hold" />
                </div>

                {/* </FormControl> */}

                <div style={{ width: "500px", display: "flex", flexDirection: "column" }}>
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
                    <Box>
                        {isAdhoc && (
                            <>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        format="DD/MM/YYYY"
                                        value={submission.submit_from_worker_date ? dayjs(submission.submit_from_worker_date, 'DD/MM/YYYY') : null}
                                        onChange={(d) => {
                                            const formattedDate = d ? d.format('YYYY-MM-DD') : '';
                                            setSubmission({ ...submission, submit_from_worker_date: formattedDate });
                                        }}
                                        maxDate={dayjs()}
                                        disabled={submission.design_number === ""}
                                        sx={{ width: '250px', mt: 1 }}
                                    />
                                </LocalizationProvider>
                                {(priceLoading && itemIndex !== "") ? <CircularProgress size={20} /> :
                                    <Typography style={{ marginTop: "10px" }}>Current Price: {currentWorkerPrice}</Typography>
                                }
                            </>
                        )}
                    </Box>
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
                            {submission?.hold_info && <HoldInfo holdInfo={submission.hold_info} />}
                            <Typography style={{ marginTop: "20px" }}>Quantity Available: {itemIndex !== "" && items[itemIndex].quantity}</Typography>
                        </>
                    }

                    <FormControl style={{ marginTop: "10px" }}>

                        <InputLabel>Quantity</InputLabel>
                        <Input disabled={submission.price === "" || submission.design_number === ""} inputProps={{ min: 1, max: maxQuantity }} type="number" value={submission.quantity}
                            onChange={(e) => { setSubmission({ ...submission, quantity: e.target.value }); console.log(submission); }}
                            onWheel={(e) => { e.target.blur(); }}
                        />
                    </FormControl>

                    {!toHold && <FormControl style={{ marginTop: "25px" }}>
                        <InputLabel>Deduction</InputLabel>
                        <Input disabled={submission.price === ""} inputProps={{ min: 0, max: maxDeduction }} type="number" value={submission.deduction} onChange={(e) => { setSubmission({ ...submission, deduction: e.target.value }); console.log(submission); }} onWheel={(e) => { e.target.blur(); }} />
                    </FormControl>}

                    <FormControl style={{ marginTop: "15px" }}>
                        <InputLabel>Remarks</InputLabel>
                        <Input disabled={(submission.price === "" || submission.design_number === "")} value={submission.remarks} onChange={(e) => { setSubmission({ ...submission, remarks: e.target.value }); console.log(submission); }} />
                    </FormControl>

                    {isAdhoc &&
                        <>
                            <FormControl style={{ marginTop: "15px" }}>
                                <InputLabel>Underprocessing Value</InputLabel>
                                <Input disabled={(submission.design_number === "")} inputProps={{ min: 0 }} type="number" value={submission.underprocessing_value} onChange={(e) => { setSubmission({ ...submission, underprocessing_value: e.target.value }) }} />
                            </FormControl>

                            <FormControl style={{ marginTop: "15px" }}>
                                <InputLabel>Remarks From Proprietor</InputLabel>
                                <Input disabled={(submission.price === "" || submission.design_number === "")} value={submission.remarks_from_proprietor} onChange={(e) => { setSubmission({ ...submission, remarks_from_proprietor: e.target.value }) }} />
                            </FormControl>
                        </>
                    }


                    <CustomButton
                        buttonProps={{ variant: "contained", color: "primary", style: { width: "100px", marginLeft: "100px", marginTop: "10px" } }}
                        isInputValid={submission.design_number !== "" && submission.quantity !== "" && submission.quantity !== "0"
                            && submission.quantity <= maxQuantity && submission.deduction <= maxDeduction
                            && submission.price !== "" && submission.price !== "0"
                            && submission.underprocessing_value !== "" && submission.underprocessing_value !== "0"
                            && (((submission.deduction === "0" || submission.deduction === "") && !toHold) || submission.remarks !== "")}
                        onClick={onSubmit}
                        successMessage="Submit successful"
                        errorMessage="Failed to submit"
                    >Submit</CustomButton>
                </div>
            </FormGroup>

        </div >
    )
}


export default Submit;