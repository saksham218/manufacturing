import React, { useEffect, useState } from 'react'
import { Routes, useMatch, Route } from 'react-router-dom'
import { Navigate } from 'react-router'

import Sidebar from './Sidebar'
import ViewManager from './viewmanager/ViewManager'
import Issue from './Issue'
import Worker from './Worker'
import Payment from './Payment'
import AddManager from './AddManager'
import { MenuItem, Select, Typography, Box } from '@mui/material'
import { getManagers } from '../../../api'



const Manager = ({ proprietor }) => {


    // var managers = [];
    const [managers, setManagers] = useState([])
    const [manager, setManager] = useState({})

    const getManagersData = async () => {
        try {
            const res = await getManagers(proprietor.proprietor_id)
            console.log(res.data)
            setManagers(res.data)
            setManager(res.data[0])
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
                    <Select value={manager} onChange={(e) => { setManager(e.target.value); console.log(manager) }}>
                        {managers.map((mgr) => (
                            <MenuItem value={mgr}>{mgr.name}</MenuItem>

                        ))}
                    </Select>
                </Box>
                <Routes>
                    <Route path="/" element={<Navigate to={`${match.pathnameBase}/viewmanager`} />} />
                    <Route path={`/viewmanager`} element={<ViewManager manager={manager} />} />
                    <Route path={`/issue`} element={<Issue manager={manager} />} />
                    <Route path={`/worker`} element={<Worker manager={manager} />} />
                    <Route path={`/payment`} element={<Payment manager={manager} />} />
                    <Route path={`/addmanager`} element={<AddManager proprietor={proprietor} />} />
                </Routes>
            </div>

        </div>
    )
}

export default Manager