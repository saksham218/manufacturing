import React, { useState, useEffect } from 'react'
import { FormGroup, Select, MenuItem, InputLabel, Input, FormControl, Button, Typography } from '@mui/material'

import { getItems, getWorkers, getWorkerDetails, addCustomPrice } from '../../../api'
import ViewTable from '../../layouts/ViewTable'

const Worker = ({ manager, proprietor }) => {
    console.log(manager)
    const [workers, setWorkers] = useState([])
    const [worker, setWorker] = useState({ worker_id: "" })
    const [workerDetails, setWorkerDetails] = useState({})

    const [items, setItems] = useState([])
    const [price, setPrice] = useState("")
    const [customPrice, setCustomPrice] = useState({ design_number: "", price: "" })

    const details = ['due_items', 'issue_history', 'submit_history', 'payment_history', 'custom_prices']
    const [detail, setDetail] = useState(details[0])

    const getWorkersData = async () => {
        try {
            const res = await getWorkers(manager.manager_id)
            console.log(res.data)
            setWorkers(res.data)
        }
        catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        console.log("get workers")
        console.log(manager)
        getWorkersData();
    }, [manager])

    const getItemsData = async () => {
        try {
            const res = await getItems(proprietor.proprietor_id)
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
    }, [])

    const onWorkerSelect = async (e) => {
        console.log(e.target.value)
        setWorker({ ...worker, worker_id: e.target.value })
        const res = await getWorkerDetails(e.target.value)
        console.log(res.data.result)
        setWorkerDetails(res.data.result)
    }

    const onItemSelect = (e) => {
        setCustomPrice({ ...customPrice, design_number: e.target.value });
        console.log(customPrice)
        const index = items.findIndex((item) => item.design_number === e.target.value)
        setPrice(items[index].price)
    }

    const onSubmit = async () => {
        try {
            const res = await addCustomPrice(customPrice, worker.worker_id)
            console.log(res.data)
            setCustomPrice({ design_number: "", price: "" })
        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        <div style={{ paddingTop: "10px" }}>

            <Select value={worker.worker_id} onChange={onWorkerSelect}>
                {workers.map((w) => (
                    <MenuItem value={w.worker_id}>{w.name}</MenuItem>
                ))}
            </Select>
            <FormGroup style={{ width: "500px", padding: "20px" }}>

                <InputLabel>Item</InputLabel>
                <Select value={customPrice.design_number} onChange={onItemSelect}>
                    {items.map((item) => (
                        <MenuItem value={item.design_number}>{item.design_number}-{item.description}</MenuItem>
                    ))}
                </Select>

                <Typography>General price: {price}</Typography>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Price</InputLabel>
                    <Input type="number" value={customPrice.price} onChange={(e) => setCustomPrice({ ...customPrice, price: e.target.value })} />
                </FormControl>
                <Button onClick={onSubmit} variant="contained" color="primary" style={{ width: "100px", marginLeft: "100px" }}
                    disabled={customPrice.design_number === "" || customPrice.price === "" || customPrice.price === "0" || worker.worker_id === ""}>Add</Button>
            </FormGroup>
            <Select value={detail} onChange={(e) => { setDetail(e.target.value); console.log(detail); console.log(workerDetails[detail]) }}>
                {details.map((d) => (
                    <MenuItem value={d}>{d.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</MenuItem>
                ))}
            </Select>
            {(workerDetails[detail] && workerDetails[detail].length > 0) ? <ViewTable data={workerDetails[detail]} />
                : <Typography>No Data for {detail.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Typography>}
        </div>
    )
}

export default Worker