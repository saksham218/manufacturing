import React, { useState, useEffect } from 'react'
import { Select, MenuItem, Typography, Box, CircularProgress } from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs'

import { getWorkerDetails } from '../../../api'
import ViewTable from '../../layouts/ViewTable'
import { useWorker } from './workerContext/WorkerContext'
import { workerDetailsViewConfig } from '../../constants/ViewConstants';

const getWorkerData = async (worker_id) => {
    try {
        const res = await getWorkerDetails(worker_id)
        console.log(res.data.result)
        return res.data.result

    }
    catch (err) {
        console.log(err)
    }
}

const getDisplayData = (chosenRange, chosenDetail, workerInfo, viewConfigData) => {
    var displayData = workerInfo[chosenDetail]
    if (displayData && viewConfigData.is_dated) {
        const start = dayjs(chosenRange.start, 'DD/MM/YYYY')
        const end = dayjs(chosenRange.end, 'DD/MM/YYYY')
        // console.log("start: ", start)
        // console.log("end:", end)
        displayData = displayData.filter((d) => {
            const dateObj = new Date(d.date)
            const dateString = ((dateObj.getDate() < 10) ? ("0" + dateObj.getDate()) : dateObj.getDate()) + "/" + ((dateObj.getMonth() < 9) ? ("0" + (dateObj.getMonth() + 1)) : (dateObj.getMonth() + 1)) + "/" + (dateObj.getFullYear())
            const date = dayjs(dateString, 'DD/MM/YYYY');
            // console.log("date: ", date)
            return (!date.isBefore(start) && !date.isAfter(end));
        });
    }
    console.log(displayData)
    return displayData

}

const ViewWorker = () => {

    const { worker } = useWorker()

    const today = new Date()
    const todayString = (today.getDate() < 10 ? "0" + today.getDate() : today.getDate()) + "/" + ((today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1)) + "/" + today.getFullYear()

    const [range, setRange] = useState({ start: todayString, end: todayString })
    const [total, setTotal] = useState(0)

    const details = Object.keys(workerDetailsViewConfig)
    console.log(details)
    const [detail, setDetail] = useState(details[0])

    const [workerDetails, setWorkerDetails] = useState({})
    const [data, setData] = useState([])

    const [viewConfig, setViewConfig] = useState({})

    const [loading, setLoading] = useState(false)

    // useEffect(() => {
    //     getWorkersData();
    // }, []);

    useEffect(() => {

        let isMounted = true;
        console.log("get worker")
        console.log(worker)
        if (worker && worker.worker_id) {
            setLoading(true)
            getWorkerData(worker.worker_id).then((workerData) => {
                if (isMounted) {
                    setWorkerDetails(workerData)
                    setLoading(false)
                }

            });
        }

        return () => { isMounted = false }

    }, [worker])

    useEffect(() => {
        let isMounted = true;
        const viewConfigData = workerDetailsViewConfig[detail]
        const displayData = getDisplayData(range, detail, workerDetails, viewConfigData);
        if (isMounted) {
            setData(displayData)
            setViewConfig(viewConfigData)
        }

        return () => { isMounted = false }
    }, [range, detail, workerDetails])


    return (
        loading ? <CircularProgress style={{ marginTop: "50px", marginLeft: "200px" }} /> :
            (<div style={{ paddingTop: "10px" }}>
                <Box style={{ display: 'flex' }}>
                    <Select value={detail} onChange={(e) => { setDetail(e.target.value); console.log(detail); }}>
                        {details.map((d) => (
                            <MenuItem value={d}>{d.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</MenuItem>
                        ))}
                    </Select>
                    <Typography style={{ padding: "10px" }}>Due Amount: {workerDetails.due_amount}</Typography>
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
                    <Typography >Total: {total}</Typography>
                    {(data && data.length > 0) ? <ViewTable data={data} keys={viewConfig.keys} />
                        : <Typography>No Data for {detail.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Typography>}
                </Box>
            </div>)
    )
}

export default ViewWorker