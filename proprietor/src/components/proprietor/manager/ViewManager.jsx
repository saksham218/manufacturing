import React, { useEffect, useState } from 'react'
import { Select, MenuItem, Typography, Box } from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs'

import { getManager } from '../../../api'
import ViewTable from '../../layouts/ViewTable'

const ViewManager = ({ manager, getManagersData }) => {

    const today = new Date()
    const todayString = (today.getDate() < 10 ? "0" + today.getDate() : today.getDate()) + "/" + ((today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1)) + "/" + today.getFullYear()

    const [range, setRange] = useState({ start: todayString, end: todayString })
    const [total, setTotal] = useState(0)

    const details = ['total_due', 'due_forward', 'due_backward', 'issue_history', 'submit_history', 'expense_requests']
    const [detail, setDetail] = useState(details[0])

    const [managerDetails, setManagerDetails] = useState({})
    const [data, setData] = useState([])

    const getManagerData = async () => {
        try {
            const res = await getManager(manager.manager_id)
            console.log(res.data)
            setManagerDetails(res.data)

        }
        catch (err) {
            console.log(err)
        }
    }

    const setDisplayData = () => {
        var displayData = managerDetails[detail]
        if (displayData && (detail === "issue_history" || detail === "submit_history" || detail === "expense_requests")) {
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

    useEffect(() => {
        getManagersData();
    }, [])

    useEffect(() => {
        console.log("get manager")
        console.log(manager)
        getManagerData();
        setDisplayData();
    }, [manager])

    useEffect(() => {
        setDisplayData();
    }, [range, detail, managerDetails])


    return (
        <div style={{ paddingTop: "10px" }}>
            <Box style={{ display: 'flex' }}>
                <Select value={detail} onChange={(e) => { setDetail(e.target.value); console.log(detail); }}>
                    {details.map((d) => (
                        <MenuItem value={d}>{d.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</MenuItem>
                    ))}
                </Select>
                <Typography style={{ padding: "10px" }}>Due Amount: {managerDetails.due_amount}</Typography>
            </Box>
            <Box style={{ padding: "10px" }}>
                {(detail === "issue_history" || detail === "submit_history" || detail === "expense_requests") ?
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
                <Typography>Total: {total}</Typography>
                {(data && data.length > 0) ? <ViewTable data={data} />
                    : <Typography>No Data for {detail.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Typography>}
            </Box>
        </div>
    )
}

export default ViewManager