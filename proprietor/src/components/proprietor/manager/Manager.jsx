import React from 'react'
import { Routes, useMatch, Route } from 'react-router-dom'
import { Navigate } from 'react-router'

import Sidebar from './Sidebar'
import ViewManager from './ViewManager'
import Issue from './Issue'
import Worker from './Worker'
import Payment from './Payment'
import AddManager from './AddManager'



const Manager = () => {

    const match = useMatch("/:proprietor/manager/*")
    console.log(match)
    return (
        <div style={{ display: 'flex', overflow: 'hidden' }}>

            <Sidebar match={match} />

            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
                <Routes>
                    <Route path="/" element={<Navigate to={`${match.pathnameBase}/viewmanager`} />} />
                    <Route path={`/viewmanager`} element={<ViewManager />} />
                    <Route path={`/issue`} element={<Issue />} />
                    <Route path={`/worker`} element={<Worker />} />
                    <Route path={`/payment`} element={<Payment />} />
                    <Route path={`/addmanager`} element={<AddManager />} />
                </Routes>
            </div>

        </div>
    )
}

export default Manager