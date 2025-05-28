import React, { useState, useEffect } from 'react'
import { useMatch, Navigate, Routes, Route } from 'react-router-dom'
import { Box, Typography, Select, MenuItem, CircularProgress } from '@mui/material'

import Sidebar from './Sidebar'
import ViewWorker from './ViewWorker'
import Issue from './Issue'
import Submit from './Submit'
import Payment from './Payment'
import AddWorker from './AddWorker'
import { getWorkers } from '../../../api'
import { useWorker } from './workerContext/WorkerContext'

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

const Worker = ({ manager }) => {
    // var workers = [];
    const [workers, setWorkers] = useState([])
    const { worker, setWorker } = useWorker()

    const [loading, setLoading] = useState(false)

    console.log("worker: ", worker)

    const setWorkersList = () => {
        setLoading(true)
        getWorkersData(manager.manager_id).then((workersData) => {
            setWorkers(workersData)
            const i = workersData.findIndex((wkr) => wkr?.worker_id === worker?.worker_id)
            console.log("worker: ", worker)
            console.log("index: ", i)
            setWorker((i !== -1) ? workersData[i] : workersData[0])
            setLoading(false)
        });
    }

    useEffect(() => {

        console.log("get workers")
        setWorkersList();

    }, [])

    const [isAddWorker, setIsAddWorker] = useState(false)

    const match = useMatch("/:manager/worker/*")
    console.log(match)
    return (
        <div style={{ display: 'flex', overflow: 'hidden' }}>

            <Sidebar match={match} setIsAddWorker={setIsAddWorker} />

            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
                <Box style={{ display: isAddWorker ? "none" : "block" }}>
                    {loading ? <CircularProgress /> : (
                        <>
                            <Typography>Select Worker</Typography>
                            <Select value={worker} onChange={(e) => { setWorker(e.target.value); console.log(worker) }}>
                                {workers.map((wkr) => (
                                    <MenuItem value={wkr}>{wkr.name}</MenuItem>

                                ))}
                            </Select>
                        </>
                    )}
                </Box>
                <Routes>
                    <Route path="/" element={<Navigate to={`${match.pathnameBase}/view`} />} />
                    <Route path={`/view`} element={worker && worker.worker_id ? <ViewWorker /> : null} />
                    <Route path={`/issue`} element={worker && worker.worker_id ? <Issue manager={manager} /> : null} />
                    <Route path={`/submit`} element={worker && worker.worker_id ? <Submit manager={manager} /> : null} />
                    {/* <Route path={`/submitadhoc`} element={<SubmitAdhoc manager={manager} />} /> */}
                    <Route path={`/payment`} element={worker && worker.worker_id ? <Payment /> : null} />
                    <Route path={`/addworker`} element={<AddWorker manager={manager} setWorkersList={setWorkersList} />} />

                </Routes>
            </div>

        </div>
    )
}

export default Worker