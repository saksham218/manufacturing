import React, { useState, useEffect } from 'react'
import { FormGroup, Select, MenuItem, InputLabel, Input, FormControl, Button, Typography } from '@mui/material'

import { getItemsForFinalSubmit, submitToProprietor } from '../../api'

const Proprietor = ({ manager }) => {
    console.log(manager)

    const [submission, setSubmission] = useState({ design_number: "", quantity: "" })
    const [items, setItems] = useState([])
    const [max, setMax] = useState(0)

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

    useEffect(() => {
        console.log("get items")
        console.log(manager)
        getItemsData();
    }, [manager])


    const onItemSelect = async (e) => {
        setSubmission({ ...submission, design_number: e.target.value })
        console.log(submission);
        const index = items.findIndex((item) => item.design_number === e.target.value)
        setMax(items[index].quantity)
        console.log(max)
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await submitToProprietor(submission, manager.manager_id)
            console.log(res.data)

            setSubmission({ design_number: "", quantity: "" })
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

                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Quantity</InputLabel>
                    <Input disabled={submission.design_number === ""} type="number" inputProps={{ min: 1, max: max }} value={submission.quantity} onChange={(e) => setSubmission({ ...submission, quantity: e.target.value })} />
                </FormControl>
                <Button variant="contained" color="primary" onClick={onSubmit} style={{ width: "100px", marginLeft: "100px" }}
                    disabled={submission.design_number === "" || submission.quantity === ""}>Submit</Button>
            </FormGroup>
        </div>
    )
}

export default Proprietor