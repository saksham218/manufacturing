import React from 'react'
import { Routes, Route, Navigate, useMatch } from 'react-router-dom'

import Header from './Header'
import Navbar from './Navbar'
import Proprietor from './Proprietor'
import Worker from './worker/Worker'
import View from './View'

const Manager = () => {


    const match = useMatch("/:manager/*")
    const manager = localStorage.getItem('manager') ? JSON.parse(localStorage.getItem('manager')) : null;


    if (!manager) {
        return <Navigate to="/login" />
    }

    return (
        <div>
            <Header manager={manager} />
            <Navbar match={match} />

            <Routes>
                <Route path="/" element={<Navigate to={`${match.pathnameBase}/view`} />} />
                <Route path={`/view`} element={<View manager={manager} />} />
                <Route path={`/worker/*`} element={<Worker manager={manager} />} />
                <Route path={`/proprietor`} element={<Proprietor manager={manager} />} />
            </Routes>
        </div>
    )
}

export default Manager