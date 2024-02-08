import React, { useState, useEffect } from 'react'
import { Select, MenuItem, Typography, Box } from '@mui/material'

import { getWorkerDetails } from '../../../api'
import ViewTable from '../../layouts/ViewTable'

const ViewWorker = ({ worker, getWorkersData }) => {
    const [workerDetails, setWorkerDetails] = useState({})

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

    useEffect(() => {
        getWorkersData();
    }, []);

    useEffect(() => {
        console.log("get worker")
        console.log(worker)
        getWorkerData();
    }, [worker])

    const details = ['due_items', 'issue_history', 'submit_history', 'payment_history', 'custom_prices']

    const [detail, setDetail] = useState(details[0])

    return (
        <div style={{ paddingTop: "10px" }}>
            <Box style={{ display: 'flex' }}>
                <Select value={detail} onChange={(e) => { setDetail(e.target.value); console.log(detail); console.log(workerDetails[detail]) }}>
                    {details.map((d) => (
                        <MenuItem value={d}>{d.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</MenuItem>
                    ))}
                </Select>
                <Typography style={{ padding: "10px" }}>Due Amount: {workerDetails.due_amount}</Typography>
            </Box>
            {(workerDetails[detail] && workerDetails[detail].length > 0) ? <ViewTable data={workerDetails[detail]} />
                : <Typography>No Data for {detail.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Typography>}

        </div>
    )
}

export default ViewWorker