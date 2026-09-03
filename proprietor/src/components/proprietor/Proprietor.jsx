import React, { useState } from 'react'
import { useMatch } from 'react-router'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'

import Header from './Header'
import Navbar from './Navbar'
import Manager from './manager/Manager'
import Item from './items/Item'
import { ManagerProvider } from './manager/managerContext/ManagerContext'
import ActionsDrawer from '../layouts/ActionsDrawer'


const Proprietor = () => {

    const match = useMatch("/:proprietor/*")
    const [proprietor] = useState(() => {
        const stored = localStorage.getItem('proprietor')
        return stored ? JSON.parse(stored) : null
    })

    if (!proprietor) {
        return <Navigate to="/login" />
    }
    console.log(match)
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Header proprietor={proprietor} />
            <Navbar match={match} />
            <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                <Box sx={{ flexGrow: 1, minWidth: 0, overflowY: 'auto' }}>
                    <Routes>
                        <Route path="/" element={<Navigate to={`${match.pathnameBase}/manager`} />} />
                        <Route path={`/manager/*`} element={
                            <ManagerProvider>
                                <Manager proprietor={proprietor} />
                            </ManagerProvider>
                        } />
                        <Route path={`/item/*`} element={<Item proprietor={proprietor} />} />
                    </Routes>
                </Box>
                <ActionsDrawer onActionUndone={() => { }} />
            </Box>
        </Box>
    )
}

export default Proprietor
