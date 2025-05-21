import React, { useEffect, useState } from 'react'
import { FormGroup, Select, MenuItem, InputLabel, Input, FormControl, Button, Typography } from '@mui/material'

import { getItemsForIssue, issueToWorker, getPriceForIssue } from '../../../api'
import { useWorker } from './workerContext/WorkerContext'
import HoldInfo from '../../layouts/HoldInfo'

const getPrice = async (worker_id, design_number, priceFromDF) => {
    if (Number(priceFromDF) > 0) {
        return priceFromDF;
    }
    try {
        const res = await getPriceForIssue(worker_id, design_number)
        console.log(res.data)
        return res.data.price
    }
    catch (err) {
        console.log(err)
    }
}

const getItemsData = async (manager_id) => {
    try {
        const res = await getItemsForIssue(manager_id)
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


const Issue = ({ manager }) => {

    const { worker } = useWorker()
    console.log(worker)
    const [issue, setIssue] = useState({ design_number: "", quantity: "", price: "", underprocessing_value: "", remarks: "" })
    const [items, setItems] = useState([])
    const [itemIndex, setItemIndex] = useState("")
    const [max, setMax] = useState(0)
    // const [isPriceFromDF, setIsPriceFromDF] = useState(false)

    const [open, setOpen] = useState(false);

    useEffect(() => {

        let isMounted = true;

        console.log("get items")
        console.log(manager)
        setItems([])
        setIssue({ design_number: "", quantity: "", price: "", underprocessing_value: "", remarks: "" })
        setItemIndex("")
        getItemsData(manager.manager_id).then((itemsData) => {
            if (isMounted) {
                setItems(itemsData)
            }

        });

        return () => { isMounted = false }
    }, [manager, worker])



    useEffect(() => {

        let isMounted = true;

        setIssue({ design_number: "", quantity: "", price: "", underprocessing_value: "", remarks: "" })
        setMax(0)

        if (itemIndex !== "" && items.length > 0) {
            getPrice(worker.worker_id, items[itemIndex].design_number, Number(items[itemIndex].price)).then((price) => {

                if (isMounted) {
                    setIssue({
                        ...issue,
                        price: price,
                        design_number: items[itemIndex].design_number,
                        quantity: "",
                        underprocessing_value: items[itemIndex].underprocessing_value,
                        remarks: items[itemIndex].remarks_from_proprietor,
                        hold_info: items[itemIndex].hold_info,
                        is_price_from_df: Number(items[itemIndex].price) > 0
                    })
                    console.log(issue);
                    setMax(items[itemIndex].quantity)
                }
            })
        }

        return () => { isMounted = false }

    }, [itemIndex, items])


    const onItemSelect = async (e) => {

        setItemIndex(e.target.value)
        console.log(itemIndex)

    }



    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await issueToWorker(issue, worker.worker_id)
            console.log(res.data)

            const itemsData = await getItemsData(manager.manager_id);
            setItems(itemsData);
            setIssue({ design_number: "", quantity: "", price: "", underprocessing_value: "", remarks: "" });
            setItemIndex("");
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
                    {items?.map((item) => (
                        <MenuItem value={item.index}>{item.design_number}-{item.description}{open ? `, Quantity Available: ${item.quantity}${item.remarks_from_proprietor !== "" ? ", Remarks: " + item.remarks_from_proprietor : ""}${item.underprocessing_value ? ", Underprocessing Value: " + item.underprocessing_value : ""}${item.price ? ", Price: " + item.price : ""}` : ""}</MenuItem>
                    ))}
                </Select>
                <Typography>Price: {issue.price}</Typography>
                <Typography>Underprocessing Value: {issue.underprocessing_value}</Typography>
                {issue.hold_info ? <HoldInfo holdInfo={issue.hold_info} /> : null}
                <Typography style={{ marginTop: "25px" }}>Quantity Available: {itemIndex !== "" && items[itemIndex].quantity}</Typography>
                <FormControl style={{ marginTop: "20px" }}>
                    <InputLabel>Quantity</InputLabel>
                    <Input disabled={issue.design_number === ""} inputProps={{ min: 1, max: max }} type="number" value={issue.quantity}
                        onChange={(e) => { setIssue({ ...issue, quantity: e.target.value }); console.log(issue); }}
                        onWheel={(e) => { e.target.blur(); }}
                    />
                </FormControl>
                {/* <Typography style={{ marginTop: "25px" }}>Thread/Raw Material Available: {itemIndex !== "" && items[itemIndex].thread_raw_material}</Typography> */}
                {/* <FormControl style={{ marginTop: "20px" }}>
                    <InputLabel>Thread Raw Material</InputLabel>
                    <Input value={issue.thread_raw_material} onChange={(e) => { setIssue({ ...issue, thread_raw_material: e.target.value }); console.log(issue); }} />
                </FormControl> */}

                <Typography>Remarks from Proprietor: {issue.remarks}</Typography>
                <Button variant="contained" color="primary" style={{ width: "100px", marginLeft: "100px", marginTop: "10px" }} onClick={onSubmit}
                    disabled={issue.design_number === "" || issue.quantity === "" || issue.quantity === "0" ||
                        issue.underprocessing_value === "" || issue.underprocessing_value === "0" ||
                        issue.quantity > max}>Issue</Button>
            </FormGroup>

        </div>
    )
}


export default Issue;