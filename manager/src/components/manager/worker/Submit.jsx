import React, { useEffect, useState } from 'react'
import { FormGroup, InputLabel, Input, FormControl, Typography, TextField, FormControlLabel, Checkbox, Box, CircularProgress, Autocomplete } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import { getItemsForSubmitFromWorker, getItems, submitFromWorker, getPricesForSubmitAdhoc } from '../../../api'
import { useWorker } from './workerContext/WorkerContext'
import HoldInfo from '../../layouts/HoldInfo'
import CustomButton from '../../layouts/CustomButton'
import { useApp } from '../../AppContext'

const getItemsData = async (proprietor_id, worker_id, isAdhoc, submit_date) => {
    try {

        let res;
        if (isAdhoc) {
            res = await getItems(proprietor_id)
        }
        else {
            res = await getItemsForSubmitFromWorker(worker_id, submit_date)
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
    const { onMutation, actionsVersion } = useApp()
    console.log(worker)
    const [submitDate, setSubmitDate] = useState(dayjs().format('YYYY-MM-DD'))
    const [submission, setSubmission] = useState({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_proprietor: "", remarks: "", underprocessing_value: "" })
    const [items, setItems] = useState([])
    const [itemIndex, setItemIndex] = useState("")
    const [isAdhoc, setIsAdhoc] = useState(false)
    const [toHold, setToHold] = useState(false)
    // const [prices, setPrices] = useState([])
    const [maxQuantity, setMaxQuantity] = useState(0)

    const [maxDeduction, setMaxDeduction] = useState(0)

    const [currentWorkerPrice, setCurrentWorkerPrice] = useState("")

    const [open, setOpen] = useState(false);

    const [itemsLoading, setItemsLoading] = useState(false)
    const [priceLoading, setPriceLoading] = useState(false)


    useEffect(() => {

        let isMounted = true;

        if (worker?.worker_id) {
            console.log("get items")
            console.log(manager)
            setItems([])
            setItemIndex("")
            setMaxQuantity(0)
            setMaxDeduction(0)
            setCurrentWorkerPrice("")
            setSubmission({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_proprietor: "", remarks: "", underprocessing_value: "", is_adhoc: isAdhoc, to_hold: toHold })
            setItemsLoading(true)
            getItemsData(manager.proprietor_id, worker.worker_id, isAdhoc, submitDate).then((itemsData) => {

                if (isMounted) {
                    setItems(itemsData)
                    setItemsLoading(false)
                }

            });
            // setPrices([])
        }

        return () => { isMounted = false }
    }, [worker?.worker_id, isAdhoc, submitDate, actionsVersion])

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
                    to_hold: toHold
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


    const handleItemSelect = (value) => {
        setItemIndex(value);
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

        const res = await submitFromWorker({ ...submission, is_adhoc: isAdhoc, to_hold: toHold, submit_date: submitDate }, worker.worker_id)
        console.log(res.data)

        setSubmission({ design_number: "", quantity: "", price: "", deduction: "", remarks_from_proprietor: "", remarks: "", underprocessing_value: "", is_adhoc: isAdhoc, to_hold: toHold })
        setItemIndex("");
        setCurrentWorkerPrice("");
        onMutation()

    }

    const getOptionLabel = (option) => {
        if (!option) return '';
        return `${option.design_number}-${option.description}` + (open && !isAdhoc ? `, Quantity Available: ${option.quantity}, Underprocessing Value: ${option.underprocessing_value}, ${option.remarks_from_proprietor ? ", Remarks from proprietor: " + option.remarks_from_proprietor : ''}` : "");
    }

    const renderOption = (props, option) => (
        <li {...props}>
            <div>
                <div>{option.design_number}-{option.description}</div>
                {!isAdhoc && (
                    <div style={{ fontSize: '0.8rem' }}>
                        Price: {option.price}, Quantity Available: {option.quantity}
                        {option.remarks_from_proprietor && (
                            <>, Remarks from proprietor: {option.remarks_from_proprietor}</>
                        )}
                    </div>
                )}
            </div>
        </li>
    )

    return (
        <div>
            <FormGroup style={{ width: "500px", paddingTop: "20px" }}>
                <Typography>Submit Date:</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        value={dayjs(submitDate, 'YYYY-MM-DD')}
                        onChange={(d) => { setSubmitDate(d.format('YYYY-MM-DD')) }}
                        format="DD/MM/YYYY"
                        slotProps={{ textField: { style: { marginBottom: "15px", width: "400px" } } }}
                    />
                </LocalizationProvider>
                {/* <FormControl style={{ padding: "15px" }}> */}
                <div style={{ display: 'flex' }}>
                    <Box style={{ marginRight: "20px", width: "400px", height: "100px" }}>
                        {itemsLoading ? <CircularProgress style={{ marginLeft: "170px", marginTop: "25px" }} /> :
                            <>
                                <Typography>Item:</Typography>
                                <Autocomplete
                                    options={items}
                                    getOptionLabel={getOptionLabel}
                                    renderOption={renderOption}
                                    value={itemIndex !== "" ? items[itemIndex] : null}
                                    onChange={(event, newValue) => {
                                        if (newValue) {
                                            handleItemSelect(newValue.index);
                                        }
                                    }}
                                    onOpen={() => setOpen(true)}
                                    onClose={() => setOpen(false)}
                                    blurOnSelect={true}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Select Item"
                                            variant="outlined"
                                        />
                                    )}
                                    style={{ width: "100%" }}
                                />
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