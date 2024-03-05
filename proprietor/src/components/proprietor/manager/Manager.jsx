import React, { useEffect, useState } from 'react'
import { Routes, useMatch, Route } from 'react-router-dom'
import { Navigate } from 'react-router'

import Sidebar from './Sidebar'
import ViewManager from './ViewManager'
import Issue from './Issue'
import Worker from './Worker'
import Payment from './Payment'
import AddManager from './AddManager'
import { MenuItem, Select, Typography, Box } from '@mui/material'
import { getManagers } from '../../../api'



const Manager = ({ proprietor, currentManager, setCurrentManager }) => {


    // var managers = [];
    const [managers, setManagers] = useState([])
    const [manager, setManager] = useState({})

    const getManagersData = async () => {
        try {
            const res = await getManagers(proprietor.proprietor_id)
            console.log(res.data)
            setManagers(res.data)
            const i = res.data.findIndex((mgr) => mgr.manager_id === currentManager.manager_id)
            console.log("index: ", i)
            if (i !== -1) {
                setManager(res.data[i])
            }
            else {
                setManager(res.data[0])
                setCurrentManager(res.data[0])
            }

        }
        catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        console.log("get managers")
        console.log(proprietor)
        getManagersData();
    }, [proprietor])

    const [isAddManager, setIsAddManager] = useState(false)

    const match = useMatch("/:proprietor/manager/*")
    console.log(match)
    return (
        <div style={{ display: 'flex', overflow: 'hidden' }}>

            <Sidebar match={match} isAddManager={isAddManager} setIsAddManager={setIsAddManager} />

            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
                <Box style={{ display: isAddManager ? "none" : "block" }}>
                    <Typography>Select Manager</Typography>
                    <Select value={manager} onChange={(e) => { setManager(e.target.value); setCurrentManager(e.target.value); console.log(manager) }}>
                        {managers.map((mgr) => (
                            <MenuItem value={mgr}>{mgr.name}</MenuItem>

                        ))}
                    </Select>
                </Box>
                <Routes>
                    <Route path="/" element={<Navigate to={`${match.pathnameBase}/viewmanager`} />} />
                    <Route path={`/viewmanager`} element={<ViewManager manager={manager} getManagersData={getManagersData} />} />
                    <Route path={`/issue`} element={<Issue manager={manager} proprietor={proprietor} />} />
                    <Route path={`/worker`} element={<Worker manager={manager} proprietor={proprietor} />} />
                    <Route path={`/payment`} element={<Payment manager={manager} />} />
                    <Route path={`/addmanager`} element={<AddManager proprietor={proprietor} />} />
                </Routes>
            </div>

        </div>
    )
}

export default Manager