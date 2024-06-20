import React, { useState, useEffect } from 'react'
import { Select, MenuItem, Typography, Box } from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs'

import { getWorkerDetails } from '../../../api'
import ViewTable from '../../layouts/ViewTable'

const ViewWorker = ({ worker, getWorkersData }) => {

    const today = new Date()
    const todayString = (today.getDate() < 10 ? "0" + today.getDate() : today.getDate()) + "/" + ((today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1)) + "/" + today.getFullYear()

    const [range, setRange] = useState({ start: todayString, end: todayString })
    const [total, setTotal] = useState(0)

    const details = ['due_items', 'issue_history', 'submit_history', 'deductions_from_proprietor', 'payment_history', 'custom_prices']
    const [detail, setDetail] = useState(details[0])

    const [workerDetails, setWorkerDetails] = useState({})
    const [data, setData] = useState([])



    const getWorkerData = async () => {
        try {
            const res = await getWorkerDetails(worker.worker_id)
            console.log(res.data.result)
            setWorkerDetails(res.data.result)

        }
        catch (err) {
            console.log(err)
        }
    }

    const setDisplayData = () => {
        var displayData = workerDetails[detail]
        if (displayData && (detail === "issue_history" || detail === "submit_history" || detail === "payment_history")) {
            const start = dayjs(range.start, 'DD/MM/YYYY')
            const end = dayjs(range.end, 'DD/MM/YYYY')
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
    }

    // useEffect(() => {
    //     getWorkersData();
    // }, []);

    useEffect(() => {
        console.log("get worker")
        console.log(worker)
        getWorkerData();
        setDisplayData();
    }, [worker])

    useEffect(() => {
        setDisplayData();
    }, [range, detail, workerDetails])


    return (
        <div style={{ paddingTop: "10px" }}>
            <Box style={{ display: 'flex' }}>
                <Select value={detail} onChange={(e) => { setDetail(e.target.value); console.log(detail); }}>
                    {details.map((d) => (
                        <MenuItem value={d}>{d.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</MenuItem>
                    ))}
                </Select>
                <Typography style={{ padding: "10px" }}>Due Amount: {workerDetails.due_amount}</Typography>
            </Box>
            <Box style={{ padding: "10px" }}>
                {(detail === "issue_history" || detail === "submit_history" || detail === "payment_history") ?
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
                <Typography >Total: {total}</Typography>
                {(data && data.length > 0) ? <ViewTable data={data} />
                    : <Typography>No Data for {detail.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Typography>}
            </Box>
        </div>
    )
}

export default ViewWorker