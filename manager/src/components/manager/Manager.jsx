import React, { useState } from 'react'
import { Routes, Route, Navigate, useMatch } from 'react-router-dom'
import { Box } from '@mui/material'

import Header from './Header'
import Navbar from './Navbar'
import Proprietor from './proprietor/Proprietor'
import Worker from './worker/Worker'
import View from './View'
import { WorkerProvider } from './worker/workerContext/WorkerContext'
import ActionsDrawer from '../layouts/ActionsDrawer'
import { AppProvider } from '../AppContext'

const Manager = () => {

    const match = useMatch("/:manager/*")
    const [manager] = useState(() => {
        const stored = localStorage.getItem('manager')
        return stored ? JSON.parse(stored) : null
    })
    console.log(manager)

    if (!manager) {
        return <Navigate to="/login" />
    }

    return (
        <AppProvider>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <Header manager={manager} />
                <Navbar match={match} />
                <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                    <Box sx={{ flexGrow: 1, minWidth: 0, overflowY: 'auto' }}>
                        <Routes>
                            <Route path="/" element={<Navigate to={`${match.pathnameBase}/view`} />} />
                            <Route path={`/view`} element={<View manager={manager} />} />
                            <Route path={`/worker/*`} element={
                                <WorkerProvider>
                                    <Worker manager={manager} />
                                </WorkerProvider>
                            } />
                            <Route path={`/proprietor/*`} element={<Proprietor manager={manager} />} />
                        </Routes>
                    </Box>
                    <ActionsDrawer />
                </Box>
            </Box>
        </AppProvider>
    )
}

export default Manager
