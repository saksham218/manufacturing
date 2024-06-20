import React, { useState, useEffect } from 'react'
import { Select, MenuItem, Typography, Box } from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs'

import { getManager } from '../../api'
import ViewTable from '../layouts/ViewTable'
import ViewNestedTable from '../layouts/ViewNestedTable';

const View = ({ manager }) => {

    const today = new Date()
    const todayString = (today.getDate() < 10 ? "0" + today.getDate() : today.getDate()) + "/" + ((today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1)) + "/" + today.getFullYear()

    const [range, setRange] = useState({ start: todayString, end: todayString })
    const [total, setTotal] = useState(0)

    const details = ['total_due', 'due_forward', 'due_backward', 'submissions', 'issue_history', 'accepted_history', 'expense_requests']
    const [detail, setDetail] = useState(details[0])

    const [managerDetails, setManagerDetails] = useState({})
    const [data, setData] = useState([])

    const [firstNonEmptyIndex, setFirstNonEmptyIndex] = useState(0)

    const getManagerData = async () => {
        try {
            const res = await getManager(manager.manager_id)
            console.log(res.data)
            setManagerDetails(res.data)
            setDisplayData(detail, range, res.data)

        }
        catch (err) {
            console.log(err)
        }
    }

    const setDisplayData = (d, r, mD) => {
        var displayData = mD[d];
        var fNEI = 0;
        console.log(displayData)
        if (displayData && (d === "issue_history" || d === "expense_requests")) {
            const start = dayjs(r.start, 'DD/MM/YYYY')
            const end = dayjs(r.end, 'DD/MM/YYYY')
            console.log("start: ", start)
            console.log("end:", end)
            displayData = displayData.filter((dt) => {
                const dateObj = new Date(dt.date)
                const dateString = ((dateObj.getDate() < 10) ? ("0" + dateObj.getDate()) : dateObj.getDate()) + "/" + ((dateObj.getMonth() < 9) ? ("0" + (dateObj.getMonth() + 1)) : (dateObj.getMonth() + 1)) + "/" + (dateObj.getFullYear())
                const date = dayjs(dateString, 'DD/MM/YYYY');
                console.log("date: ", date)
                return (!date.isBefore(start) && !date.isAfter(end));
            });
        }

        if (displayData && d === "accepted_history") {
            const start = dayjs(r.start, 'DD/MM/YYYY')
            const end = dayjs(r.end, 'DD/MM/YYYY')
            console.log("start: ", start)
            console.log("end:", end)
            displayData = displayData.map((dt) => {
                const items = dt.items.filter((item) => {
                    const dateObj = new Date(item.date)
                    const dateString = ((dateObj.getDate() < 10) ? ("0" + dateObj.getDate()) : dateObj.getDate()) + "/" + ((dateObj.getMonth() < 9) ? ("0" + (dateObj.getMonth() + 1)) : (dateObj.getMonth() + 1)) + "/" + (dateObj.getFullYear())
                    const date = dayjs(dateString, 'DD/MM/YYYY');
                    return (!date.isBefore(start) && !date.isAfter(end));
                })
                return { ...dt, items: items };
            })

            fNEI = displayData.findIndex((dt) => dt.items.length > 0)
        }

        console.log(fNEI)
        setFirstNonEmptyIndex(fNEI)
        console.log(displayData)
        console.log(managerDetails)
        setData(displayData)
    }

    // const onDateChange = () => {
    //     console.log(range)
    //     setDisplayData();
    // }

    useEffect(() => {
        console.log("get manager")
        console.log(manager)
        getManagerData();
        setDisplayData(detail, range, managerDetails);
    }, [manager])

    // useEffect(() => {
    //     setDisplayData();
    // }, [range, detail, managerDetails])



    return (
        <div style={{ padding: "10px" }}>
            <Box style={{ display: 'flex' }}>
                <Select value={detail} onChange={(e) => { setDetail(e.target.value); setDisplayData(e.target.value, range, managerDetails); console.log(detail); }}>
                    {details.map((d) => (
                        <MenuItem value={d}>{d.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</MenuItem>
                    ))}
                </Select>
                <Typography style={{ padding: "10px" }}>Due Amount: {managerDetails.due_amount}</Typography>
            </Box>
            <Box style={{ padding: "10px" }}>

                {(detail === "issue_history" || detail === "accepted_history" || detail === "expense_requests") ?
                    <Box style={{ display: "flex" }}>
                        <Box >
                            <Typography>From:</Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker format='DD/MM/YYYY' value={dayjs(range.start, 'DD/MM/YYYY')} onChange={(d) => { console.log(d); setRange({ ...range, start: d.format('DD/MM/YYYY') }); setDisplayData(detail, { ...range, start: d.format('DD/MM/YYYY') }, managerDetails); console.log(range); }} />
                            </LocalizationProvider>
                        </Box>
                        <Box style={{ paddingLeft: "10px" }}>
                            <Typography>To:</Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker format='DD/MM/YYYY' value={dayjs(range.end, 'DD/MM/YYYY')} onChange={(d) => { console.log(d); setRange({ ...range, end: d.format('DD/MM/YYYY') }); setDisplayData(detail, { ...range, end: d.format('DD/MM/YYYY') }, managerDetails); console.log(range); }} />
                            </LocalizationProvider>
                        </Box>
                    </Box> : null}
                <Typography>Total: {total}</Typography>

                {(data && data.length > 0 && (firstNonEmptyIndex !== -1)) ? ((detail === "due_backward" || detail === "submissions" || detail === "accepted_history") ? <ViewNestedTable data={data} firstNonEmptyIndex={firstNonEmptyIndex} /> : <ViewTable data={data} />)
                    : <Typography>No Data for {detail.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Typography>}
            </Box>
        </div>
    )
}

export default View