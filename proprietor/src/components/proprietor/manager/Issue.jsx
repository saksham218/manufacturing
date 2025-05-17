import React, { useEffect, useState } from 'react'
import { FormGroup, Select, MenuItem, InputLabel, Input, FormControl, Button, Typography, FormControlLabel, Box, Checkbox } from '@mui/material'

import { getItems, getOnHoldItems, issueOnHoldItemsToManager, issueToManager } from '../../../api'
import { useManager } from './managerContext/ManagerContext'
import { computeBackgroundColor } from '../../utils/viewUtils'


const getItemsData = async (proprietor_id) => {
    try {
        const res = await getItems(proprietor_id)
        console.log(res.data)
        return res.data
    }
    catch (err) {
        console.log(err)
    }
}

const getOnHoldItemsData = async (proprietor_id) => {
    try {
        const res = await getOnHoldItems(proprietor_id)
        console.log(res.data)
        return res.data
    }
    catch (err) {
        console.log(err)
    }
}

const Issue = ({ proprietor }) => {

    const { manager } = useManager()
    console.log(manager)
    const [issue, setIssue] = useState({})
    const [items, setItems] = useState([])

    const [issueHoldItems, setIssueHoldItems] = useState(false)

    const [itemIndex, setItemIndex] = useState("")

    const [maxQuantity, setMaxQuantity] = useState(0)

    const [open, setOpen] = useState(false)

    const setEmptyIssue = () => {
        console.log("set empty issue, issueHoldItems: ", issueHoldItems)
        setIssue(currentIssue => {

            let newIssue;
            if (!issueHoldItems) {
                newIssue = { design_number: "", quantity: "", underprocessing_value: "", general_price: "", remarks: "" }
            }
            else {
                newIssue = {
                    design_number: "",
                    quantity: "",
                    new_price: "",
                    new_underprocessing_value: "",
                    new_remarks_from_proprietor: "",
                    price: "",
                    partial_payment: "",
                    underprocessing_value: "",
                    remarks_from_proprietor: "",
                    deduction_from_manager: "",
                    remarks_from_manager: "",
                    put_on_hold_by: "",
                    holding_remarks: "",
                    is_adhoc: "",
                    worker_id: "",
                    manager_id: "",
                    hold_info: ""
                }
            }
            return newIssue;
        })

    }

    useEffect(() => {
        console.log("get items")
        console.log(proprietor)

        setEmptyIssue();
        setItemIndex("");
        setMaxQuantity("");
        const getData = issueHoldItems ? getOnHoldItemsData : getItemsData;
        console.log(getData);
        getData(proprietor.proprietor_id).then((itemsData) => {
            let i = 0;
            const indexedItemsData = itemsData.map((item) => {
                return { ...item, index: i++ }
            })
            setItems(indexedItemsData)
        });
    }, [proprietor, issueHoldItems])


    useEffect(() => {

        if (items && items.length > 0 && itemIndex !== "") {
            setIssue(currentIssue => {
                let newIssue;
                if (!issueHoldItems) {
                    newIssue = { design_number: items[itemIndex].design_number, quantity: "", underprocessing_value: items[itemIndex].underprocessing_value, general_price: items[itemIndex].price, remarks: "" };
                }
                else {
                    newIssue = {
                        design_number: items[itemIndex].item.design_number,
                        quantity: "",
                        new_price: items[itemIndex].price,
                        new_underprocessing_value: items[itemIndex].underprocessing_value,
                        new_remarks_from_proprietor: items[itemIndex].remarks_from_proprietor,
                        price: items[itemIndex].price,
                        partial_payment: items[itemIndex].partial_payment,
                        underprocessing_value: items[itemIndex].underprocessing_value,
                        remarks_from_proprietor: items[itemIndex].remarks_from_proprietor,
                        deduction_from_manager: items[itemIndex].deduction_from_manager,
                        remarks_from_manager: items[itemIndex].remarks_from_manager,
                        put_on_hold_by: items[itemIndex].put_on_hold_by,
                        holding_remarks: items[itemIndex].holding_remarks,
                        is_adhoc: items[itemIndex].is_adhoc,
                        worker_id: items[itemIndex].worker.worker_id,
                        manager_id: items[itemIndex].manager.manager_id,
                        hold_info: items[itemIndex].hold_info
                    };
                }

                return newIssue;
            })
            setMaxQuantity(issueHoldItems ? items[itemIndex].quantity : "");
        }
        else {
            setEmptyIssue();
        }

    }, [items, itemIndex])


    const handleItemSelect = (e) => {
        console.log(e.target.value);
        setItemIndex(e.target.value);
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            const issueToManagerFun = issueHoldItems ? issueOnHoldItemsToManager : issueToManager;
            console.log(issueToManagerFun);
            const res = await issueToManagerFun(issue, manager.manager_id)
            console.log(res.data)

            setEmptyIssue();
        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        <div>
            <FormGroup style={{ width: "600px", padding: "20px" }}>
                <div style={{ display: 'flex' }}>
                    <Box style={{ marginRight: "20px" }}>

                        <InputLabel>Item</InputLabel>
                        <Select style={{ width: "400px" }} value={itemIndex} onChange={handleItemSelect} onOpen={() => { setOpen(true) }} onClose={() => { setOpen(false) }}>
                            {items.map((item) => (
                                !issueHoldItems ?
                                    <MenuItem value={item.index}>{item.design_number}-{item.description}</MenuItem>
                                    : <MenuItem style={{ 'backgroundColor': computeBackgroundColor(item) }} value={item.index}>{item.item?.design_number}-{item.item?.description}{open ? `, Quantity Available: ${item.quantity}, Old Price: ${item.price}, Old Underprocessing Value: ${item.underprocessing_value}, Partial Payment: ${item.partial_payment}${item.holding_remarks !== "" ? ", Holding Remarks: " + item.holding_remarks : ""}` : ""}</MenuItem>
                            ))}
                        </Select>
                    </Box>
                    <FormControlLabel control={<Checkbox checked={issueHoldItems} onChange={(e) => { setIssueHoldItems(e.target.checked) }} />} label="Issue Hold Items" />
                </div>
                <div style={{ width: "400px", display: "flex", flexDirection: "column" }}>
                    {!issueHoldItems ?
                        <>
                            <Typography>General price: {issue.general_price}</Typography>
                            <FormControl style={{ marginTop: "15px" }}>
                                <InputLabel>Quantity</InputLabel>
                                <Input type="number" value={issue.quantity}
                                    inputProps={{ min: 0 }}
                                    onChange={(e) => { setIssue({ ...issue, quantity: e.target.value }); console.log(issue); }}
                                    onWheel={(e) => { e.target.blur(); }}
                                    disabled={issue.design_number === ""}
                                />
                            </FormControl>
                            <FormControl style={{ marginTop: "15px" }}>
                                <InputLabel>Underprocessing Value</InputLabel>
                                <Input type="number" value={issue.underprocessing_value}
                                    inputProps={{ min: 0 }}
                                    onChange={(e) => { setIssue({ ...issue, underprocessing_value: e.target.value }); console.log(issue); }}
                                    onWheel={(e) => { e.target.blur() }} />
                            </FormControl>

                            <FormControl style={{ marginTop: "15px" }}>
                                <InputLabel>Remarks</InputLabel>
                                <Input value={issue.remarks} onChange={(e) => { setIssue({ ...issue, remarks: e.target.value }); console.log(issue); }} />
                            </FormControl>
                        </>
                        :
                        <>
                            <div style={{ backgroundColor: computeBackgroundColor(issue), padding: "10px", borderRadius: "5px" }}>
                                <Typography>Old Price: {issue.price}</Typography>
                                <Typography>Partial Payment: {issue.partial_payment}</Typography>
                                <Typography>Old Underprocessing Value: {issue.underprocessing_value}</Typography>
                                <Typography>Old Remarks from Proprietor: {issue.remarks_from_proprietor}</Typography>
                                <Typography>Worker: {issue.worker_id}</Typography>
                                <Typography>Manager: {issue.manager_id}</Typography>
                                <Typography>Deduction from Manager: {issue.deduction_from_manager}</Typography>
                                <Typography>Remarks from Manager: {issue.remarks_from_manager}</Typography>
                                <Typography>Put on Hold By: {issue.put_on_hold_by}</Typography>
                                <Typography>Holding Remarks: {issue.holding_remarks}</Typography>
                            </div>
                            <FormControl style={{ marginTop: "15px" }}>
                                <InputLabel shrink={!!issue.new_price}>New Price</InputLabel>
                                <Input type="number" value={issue.new_price || ""}
                                    inputProps={{ min: 0 }}
                                    onChange={(e) => { setIssue({ ...issue, new_price: e.target.value }); console.log(issue); }}
                                    onWheel={(e) => { e.target.blur(); }} />
                            </FormControl>
                            <Typography style={{ marginTop: "15px" }}>Quantity Available: {maxQuantity}</Typography>
                            <FormControl style={{ marginTop: "5px" }}>
                                <InputLabel>Quantity</InputLabel>
                                <Input type="number" value={issue.quantity}
                                    inputProps={{ min: 0, max: maxQuantity }}
                                    onChange={(e) => { setIssue({ ...issue, quantity: e.target.value }); console.log(issue); }}
                                    onWheel={(e) => { e.target.blur(); }} />
                            </FormControl>
                            <FormControl style={{ marginTop: "15px" }}>
                                <InputLabel>New Underprocessing Value</InputLabel>
                                <Input type="number" value={issue.new_underprocessing_value || ""}
                                    inputProps={{ min: 0 }}
                                    onChange={(e) => { setIssue({ ...issue, new_underprocessing_value: e.target.value }); console.log(issue); }}
                                    onWheel={(e) => { e.target.blur() }} />
                            </FormControl>
                            <FormControl style={{ marginTop: "15px" }}>
                                <InputLabel>New Remarks</InputLabel>
                                <Input value={issue.new_remarks_from_proprietor} onChange={(e) => { setIssue({ ...issue, new_remarks_from_proprietor: e.target.value }); console.log(issue); }} />
                            </FormControl>
                        </>}
                    <Button variant="contained" color="primary" style={{ width: "100px", marginLeft: "100px", marginTop: "10px" }} onClick={onSubmit}
                        disabled={issue.design_number === "" || issue.quantity === "" || issue.quantity === "0" ||
                            issue.underprocessing_value === "" || issue.underprocessing_value === "0"}>Issue</Button>
                </div>
            </FormGroup>

        </div>
    )
}


export default Issue;