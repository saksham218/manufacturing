import React, { useState, useEffect } from 'react'
import { FormGroup, Select, MenuItem, InputLabel, Input, FormControl, Button, Typography, Box } from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs'

import { getItems, getWorkers, getWorkerDetails, addCustomPrice } from '../../../api'
import ViewTable from '../../layouts/ViewTable'
import { useManager } from './managerContext/ManagerContext'
import { workerDetailsViewConfig } from '../../constants/ViewConstants';

const getWorkersData = async (manager_id) => {
    try {
        const res = await getWorkers(manager_id)
        console.log(res.data)
        return res.data
    }
    catch (err) {
        console.log(err)
    }
}

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

const getWorkerData = async (worker_id) => {
    try {
        const res = await getWorkerDetails(worker_id)
        console.log(res.data)
        return res.data.result
    }
    catch (err) {
        console.log(err)
    }
}


const Worker = ({ proprietor }) => {

    const { manager } = useManager()
    console.log(manager)

    const today = new Date()
    const todayString = (today.getDate() < 10 ? "0" + today.getDate() : today.getDate()) + "/" + ((today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1)) + "/" + today.getFullYear()

    const [range, setRange] = useState({ start: todayString, end: todayString })
    const [total, setTotal] = useState(0)

    const [workers, setWorkers] = useState([])
    const [worker, setWorker] = useState({ worker_id: "" })
    const [workerDetails, setWorkerDetails] = useState({})
    const [data, setData] = useState([])


    const [items, setItems] = useState([])
    const [price, setPrice] = useState("")
    const [customPrice, setCustomPrice] = useState({ design_number: "", price: "" })

    const details = Object.keys(workerDetailsViewConfig)
    console.log(details)
    const [detail, setDetail] = useState(details[0])

    const [viewConfig, setViewConfig] = useState({})


    const setDisplayData = (chosenRange, chosenDetail, workerInfo) => {
        const viewConfigData = workerDetailsViewConfig[chosenDetail]
        var displayData = workerInfo ? workerInfo[chosenDetail] : null
        if (displayData && viewConfigData.is_dated) {
            const start = dayjs(chosenRange.start, 'DD/MM/YYYY')
            const end = dayjs(chosenRange.end, 'DD/MM/YYYY')
            console.log("start: ", start)
            console.log("end:", end)
            displayData = displayData.filter((d) => {
                const dateObj = new Date(d.date)
                const dateString = ((dateObj.getDate() < 10) ? ("0" + dateObj.getDate()) : dateObj.getDate()) + "/" + ((dateObj.getMonth() < 9) ? ("0" + (dateObj.getMonth() + 1)) : (dateObj.getMonth() + 1)) + "/" + (dateObj.getFullYear())
                const date = dayjs(dateString, 'DD/MM/YYYY');
                console.log("date: ", date)
                return (!date.isBefore(start) && !date.isAfter(end));
            });
        }
        console.log(displayData)
        setData(displayData)
        console.log(viewConfigData)
        setViewConfig(viewConfigData)
    }

    useEffect(() => {
        console.log("get items")
        console.log(manager)
        getItemsData(proprietor.proprietor_id).then((itemsData) => {
            setItems(itemsData)
        });
    }, [])

    useEffect(() => {

        let isMounted = true;

        console.log("get workers")
        console.log(manager)
        setWorker({ worker_id: "" })
        setWorkerDetails({})
        setData([]);
        setWorkers([])
        getWorkersData(manager.manager_id).then((workersData) => {
            if (isMounted) {
                setWorkers(workersData)
            }
            // setWorkers(data)
        })

        return () => { isMounted = false }
    }, [manager])



    useEffect(() => {
        setDisplayData(range, detail, workerDetails);
    }, [range, detail, workerDetails])

    useEffect(() => {
        let isMounted = true;
        setCustomPrice({ design_number: "", price: "" })
        setPrice("")
        if (worker) {
            getWorkerData(worker.worker_id).then((workerData) => {

                if (isMounted) {
                    setWorkerDetails(workerData)
                }
            })
        }

        return () => { isMounted = false }
    }, [worker])

    const onWorkerSelect = async (e) => {
        console.log(e.target.value)
        setWorker({ ...worker, worker_id: e.target.value })
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
            const result = await getWorkerData(worker.worker_id);
            setWorkerDetails(result)
            setCustomPrice({ design_number: "", price: "" })
            setPrice("")

        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        <div style={{ paddingTop: "10px" }}>
            <Typography>Select Worker</Typography>
            <Select value={worker?.worker_id} onChange={onWorkerSelect}>
                {workers?.map((w) => (
                    <MenuItem value={w.worker_id}>{w.name}</MenuItem>
                ))}
            </Select>
            <Box style={{ display: 'flex' }}>
                <Box style={{ paddingTop: '20px', paddingRight: '30px' }}>
                    <Typography>Add Custom Price:</Typography>
                    <FormGroup style={{ width: "200px" }}>

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
                </Box>
                <Box style={{ width: '800px', paddingTop: '20px' }}>
                    <Box style={{ display: 'flex' }}>
                        <Select value={detail} onChange={(e) => { setDetail(e.target.value); console.log(detail); console.log(workerDetails[detail]) }}>
                            {details.map((d) => (
                                <MenuItem value={d}>{d.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</MenuItem>
                            ))}
                        </Select>
                        <Typography style={{ padding: "10px" }}>Due Amount: {workerDetails?.due_amount}</Typography>
                    </Box>
                    <Box style={{ padding: "10px" }}>
                        {viewConfig.is_dated ?
                            <Box style={{ display: "flex" }}>
                                <Box >
                                    <Typography>From:</Typography>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker format='DD/MM/YYYY' value={dayjs(range.start, 'DD/MM/YYYY')} onChange={(d) => { console.log(d); setRange({ ...range, start: d.format('DD/MM/YYYY') }); console.log(range); }} />
                                    </LocalizationProvider>
                                </Box>
                                <Box style={{ paddingLeft: "10px" }}>
                                    <Typography>To:</Typography>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker format='DD/MM/YYYY' value={dayjs(range.end, 'DD/MM/YYYY')} onChange={(d) => { console.log(d); setRange({ ...range, end: d.format('DD/MM/YYYY') }); console.log(range); }} />
                                    </LocalizationProvider>
                                </Box>
                            </Box> : null}
                        <Typography style={{ paddingTop: "40px", paddingLeft: "20px" }}>Total: {total}</Typography>
                        {(data && data.length > 0) ? <ViewTable data={data} keys={viewConfig.keys} />
                            : <Typography>No Data for {detail.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Typography>}
                    </Box>
                </Box>
            </Box>
        </div>
    )
}

export default Worker