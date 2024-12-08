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


const Worker = ({ manager, currentWorker, setCurrentWorker }) => {
    // var workers = [];
    const [workers, setWorkers] = useState([])
    const [worker, setWorker] = useState({})

    const getWorkersData = async () => {
        try {
            const res = await getWorkers(manager.manager_id)
            console.log(res.data)
            setWorkers(res.data)
            const i = res.data.findIndex((wkr) => wkr.worker_id === currentWorker.worker_id)
            console.log("index: ", i)
            if (i !== -1) {
                setWorker(res.data[i])
            }
            else {
                setWorker(res.data[0])
                setCurrentWorker(res.data[0])
            }
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

    const [isAddWorker, setIsAddWorker] = useState(false)

    const match = useMatch("/:manager/worker/*")
    console.log(match)
    return (
        <div style={{ display: 'flex', overflow: 'hidden' }}>

            <Sidebar match={match} setIsAddWorker={setIsAddWorker} />

            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
                <Box style={{ display: isAddWorker ? "none" : "block" }}>
                    <Typography>Select Worker</Typography>
                    <Select value={worker} onChange={(e) => { setWorker(e.target.value); setCurrentWorker(e.target.value); console.log(worker) }}>
                        {workers.map((wkr) => (
                            <MenuItem value={wkr}>{wkr.name}</MenuItem>

                        ))}
                    </Select>
                </Box>
                <Routes>
                    <Route path="/" element={<Navigate to={`${match.pathnameBase}/view`} />} />
                    <Route path={`/view`} element={<ViewWorker worker={worker} getWorkersData={getWorkersData} />} />
                    <Route path={`/issue`} element={<Issue worker={worker} manager={manager} />} />
                    <Route path={`/submit`} element={<Submit worker={worker} manager={manager} />} />
                    <Route path={`/submitadhoc`} element={<SubmitAdhoc worker={worker} manager={manager} />} />
                    <Route path={`/payment`} element={<Payment worker={worker} />} />
                    <Route path={`/addworker`} element={<AddWorker manager={manager} />} />

                </Routes>
            </div>

        </div>
    )
}

export default Worker