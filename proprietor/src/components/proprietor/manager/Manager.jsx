import React, { useEffect, useState } from 'react'
import { Routes, useMatch, Route } from 'react-router-dom'
import { Navigate } from 'react-router'

import Sidebar from './Sidebar'
import ViewManager from './ViewManager'
import Issue from './Issue'
import Accept from './accept/Accept'
import Worker from './Worker'
import Payment from './Payment'
import AddManager from './AddManager'
import { MenuItem, Select, Typography, Box } from '@mui/material'
import { getManagers } from '../../../api'
import { useManager } from './managerContext/ManagerContext'

const getManagersData = async (proprietor_id) => {
    try {
        const res = await getManagers(proprietor_id)
        console.log(res.data)
        return res.data

    }
    catch (err) {
        console.log(err)
    }
}

const Manager = ({ proprietor }) => {


    // var managers = [];
    const [managers, setManagers] = useState([])
    const { manager, setManager } = useManager()

    const setManagersList = () => {
        getManagersData(proprietor.proprietor_id).then((managersData) => {
            setManagers(managersData)
        });
    }

    useEffect(() => {
        console.log("get managers")
        setManagersList();
    }, [])

    useEffect(() => {
        const i = managers.findIndex((mgr) => mgr?.manager_id === manager?.manager_id)
        console.log("manager: ", manager)
        console.log("index: ", i)
        setManager((i !== -1) ? managers[i] : managers[0])
    }, [managers])

    const [isAddManager, setIsAddManager] = useState(false)

    const match = useMatch("/:proprietor/manager/*")
    console.log(match)
    return (
        <div style={{ display: 'flex', overflow: 'hidden' }}>

            <Sidebar match={match} isAddManager={isAddManager} setIsAddManager={setIsAddManager} />

            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
                <Box style={{ display: isAddManager ? "none" : "block" }}>
                    <Typography>Select Manager</Typography>
                    <Select value={manager} onChange={(e) => { setManager(e.target.value); console.log(manager) }}>
                        {managers.map((mgr) => (
                            <MenuItem value={mgr}>{mgr.name}</MenuItem>

                        ))}
                    </Select>
                </Box>
                <Routes>
                    <Route path="/" element={<Navigate to={`${match.pathnameBase}/viewmanager`} />} />
                    <Route path={`/viewmanager`} element={<ViewManager />} />
                    <Route path={`/issue`} element={<Issue proprietor={proprietor} />} />
                    <Route path={`/accept`} element={<Accept />} />
                    <Route path={`/worker`} element={<Worker proprietor={proprietor} />} />
                    <Route path={`/payment`} element={<Payment />} />
                    <Route path={`/addmanager`} element={<AddManager proprietor={proprietor} setManagersList={setManagersList} />} />
                </Routes>
            </div>

        </div>
    )
}

export default Manager