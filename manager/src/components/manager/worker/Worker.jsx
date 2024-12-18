import React, { useState, useEffect } from 'react'
import { useMatch, Navigate, Routes, Route } from 'react-router-dom'
import { Box, Typography, Select, MenuItem } from '@mui/material'

import Sidebar from './Sidebar'
import ViewWorker from './ViewWorker'
import Issue from './Issue'
import Submit from './Submit'
import Payment from './Payment'
import AddWorker from './AddWorker'
import { getWorkers } from '../../../api'
import SubmitAdhoc from './SubmitAdhoc'
import { useWorker } from './workerContext/WorkerContext'


const Worker = ({ manager }) => {
    // var workers = [];
    const [workers, setWorkers] = useState([])
    const { worker, setWorker } = useWorker()

    console.log("worker: ", worker)

    const getWorkersData = async () => {
        try {
            const res = await getWorkers(manager.manager_id)
            console.log(res.data)
            return res.data
        }
        catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {


        console.log("get workers")
        getWorkersData().then((workersData) => {
            setWorkers(workersData)
        });

    }, [])

    useEffect(() => {
        const i = workers.findIndex((wkr) => wkr?.worker_id === worker?.worker_id)
        console.log("worker: ", worker)
        console.log("index: ", i)
        setWorker((i !== -1) ? workers[i] : workers[0])
    }, [workers])

    const [isAddWorker, setIsAddWorker] = useState(false)

    const match = useMatch("/:manager/worker/*")
    console.log(match)
    return (
        <div style={{ display: 'flex', overflow: 'hidden' }}>

            <Sidebar match={match} setIsAddWorker={setIsAddWorker} />

            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
                <Box style={{ display: isAddWorker ? "none" : "block" }}>
                    <Typography>Select Worker</Typography>
                    <Select value={worker} onChange={(e) => { setWorker(e.target.value); console.log(worker) }}>
                        {workers.map((wkr) => (
                            <MenuItem value={wkr}>{wkr.name}</MenuItem>

                        ))}
                    </Select>
                </Box>
                <Routes>
                    <Route path="/" element={<Navigate to={`${match.pathnameBase}/view`} />} />
                    <Route path={`/view`} element={<ViewWorker />} />
                    <Route path={`/issue`} element={<Issue manager={manager} />} />
                    <Route path={`/submit`} element={<Submit manager={manager} />} />
                    <Route path={`/submitadhoc`} element={<SubmitAdhoc manager={manager} />} />
                    <Route path={`/payment`} element={<Payment />} />
                    <Route path={`/addworker`} element={<AddWorker manager={manager} />} />

                </Routes>
            </div>

        </div>
    )
}

export default Worker