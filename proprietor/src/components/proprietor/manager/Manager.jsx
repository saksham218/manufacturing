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
import { Typography, Box, CircularProgress, TextField, Autocomplete } from '@mui/material'
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
    const [loading, setLoading] = useState(false)

    const setManagersList = () => {
        setLoading(true)
        getManagersData(proprietor.proprietor_id).then((managersData) => {
            setManagers(managersData)
            const i = managersData.findIndex((mgr) => mgr?.manager_id === manager?.manager_id)
            console.log("manager: ", manager)
            console.log("index: ", i)
            setManager((i !== -1) ? managersData[i] : managersData[0])
            setLoading(false)
        });
    }

    useEffect(() => {
        console.log("get managers")
        setManagersList();
    }, [])

    // useEffect(() => {

    // }, [managers])

    const [isAddManager, setIsAddManager] = useState(false)

    const match = useMatch("/:proprietor/manager/*")
    console.log(match)
    return (
        <div style={{ display: 'flex', overflow: 'hidden' }}>

            <Sidebar match={match} isAddManager={isAddManager} setIsAddManager={setIsAddManager} />

            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
                <Box style={{ display: isAddManager ? "none" : "block" }}>
                    {loading ? <CircularProgress /> : (
                        <>
                            <Typography>Manager:</Typography>
                            <Autocomplete
                                options={managers}
                                getOptionLabel={(option) => option.name || ''}
                                value={manager}
                                onChange={(event, newValue) => {
                                    setManager(newValue);
                                    console.log(newValue);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        placeholder="Select a manager"
                                    />
                                )}
                                style={{ width: 200 }}
                            />
                        </>
                    )}
                </Box>
                <Routes>
                    <Route path="/" element={<Navigate to={`${match.pathnameBase}/viewmanager`} />} />
                    <Route path={`/viewmanager`} element={manager && manager.manager_id ? <ViewManager /> : null} />
                    <Route path={`/issue`} element={manager && manager.manager_id ? <Issue proprietor={proprietor} /> : null} />
                    <Route path={`/accept`} element={manager && manager.manager_id ? <Accept /> : null} />
                    <Route path={`/worker`} element={manager && manager.manager_id ? <Worker proprietor={proprietor} /> : null} />
                    <Route path={`/payment`} element={manager && manager.manager_id ? <Payment /> : null} />
                    <Route path={`/addmanager`} element={<AddManager proprietor={proprietor} setManagersList={setManagersList} />} />
                </Routes>
            </div>

        </div>
    )
}

export default Manager