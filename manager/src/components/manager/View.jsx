import React, { useState, useEffect } from 'react'
import { Select, MenuItem, Typography, Box, CircularProgress } from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs'

import { getManager } from '../../api'
import ViewTable from '../layouts/ViewTable'
import ViewNestedTable from '../layouts/ViewNestedTable';
import { managerDetailsViewConfig } from '../constants/ViewConstants'

const getManagerData = async (manager_id) => {
    try {
        const res = await getManager(manager_id)
        console.log(res.data)
        return res.data
    }
    catch (err) {
        console.log(err)
    }
}

const View = ({ manager }) => {

    const today = new Date()
    const todayString = (today.getDate() < 10 ? "0" + today.getDate() : today.getDate()) + "/" + ((today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1)) + "/" + today.getFullYear()

    const [range, setRange] = useState({ start: todayString, end: todayString })
    const [total, setTotal] = useState(0)

    const details = Object.keys(managerDetailsViewConfig)
    console.log(details)
    const [detail, setDetail] = useState(details[0])

    const [managerDetails, setManagerDetails] = useState({})
    const [data, setData] = useState([])

    const [firstNonEmptyIndex, setFirstNonEmptyIndex] = useState(-1)

    const [viewConfig, setViewConfig] = useState({})

    const [loading, setLoading] = useState(false)


    const setDisplayData = (r, d, mD) => {
        const viewConfigData = managerDetailsViewConfig[d]
        var displayData = mD[d];
        var fNEI = -1;
        console.log(displayData)
        if (displayData && viewConfigData.is_dated) {
            const start = dayjs(r.start, 'DD/MM/YYYY')
            const end = dayjs(r.end, 'DD/MM/YYYY')
            // console.log("start: ", start)
            // console.log("end:", end)
            displayData = displayData.filter((dt) => {
                const dateObj = new Date(dt.date)
                const dateString = ((dateObj.getDate() < 10) ? ("0" + dateObj.getDate()) : dateObj.getDate()) + "/" + ((dateObj.getMonth() < 9) ? ("0" + (dateObj.getMonth() + 1)) : (dateObj.getMonth() + 1)) + "/" + (dateObj.getFullYear())
                const date = dayjs(dateString, 'DD/MM/YYYY');
                // console.log("date: ", date)
                return (!date.isBefore(start) && !date.isAfter(end));
            });
        }

        if (displayData && viewConfigData.is_grouped) {
            fNEI = displayData.findIndex((dt) => dt.items.length > 0)
        }

        console.log(fNEI)
        setFirstNonEmptyIndex(fNEI)
        console.log(displayData)
        setData(displayData)
        console.log(viewConfigData)
        setViewConfig(viewConfigData)
    }

    // const onDateChange = () => {
    //     console.log(range)
    //     setDisplayData();
    // }

    useEffect(() => {
        console.log("get manager")
        console.log(manager)
        setLoading(true)
        getManagerData(manager.manager_id).then((managerData) => {
            setLoading(false)
            setManagerDetails(managerData)
        });

    }, [manager])



    useEffect(() => {
        setDisplayData(range, detail, managerDetails);
    }, [range, detail, managerDetails])



    return (
        loading ? <CircularProgress style={{ marginTop: "50px", marginLeft: "50px" }} /> :
            (<div style={{ padding: "10px" }}>
                <Box style={{ display: 'flex' }}>
                    <Select value={detail} onChange={(e) => { setDetail(e.target.value); console.log(detail); }}>
                        {details.map((d) => (
                            <MenuItem value={d}>{d.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</MenuItem>
                        ))}
                    </Select>
                    <Typography style={{ padding: "10px" }}>Due Amount: {managerDetails.due_amount}</Typography>
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
                    <Typography>Total: {total}</Typography>

                    {(data && data.length > 0 && (!viewConfig.is_grouped || firstNonEmptyIndex !== -1)) ? (viewConfig.is_grouped ? <ViewNestedTable data={data} groupingKeys={viewConfig.grouping_keys} keys={viewConfig.keys} /> : <ViewTable data={data} keys={viewConfig.keys} />)
                        : <Typography>No Data for {detail.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Typography>}
                </Box>
            </div>)
    )
}

export default View