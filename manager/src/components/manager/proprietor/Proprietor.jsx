import React from 'react'
import { Routes, Route, Navigate, useMatch } from 'react-router-dom'


import ExpenseRequest from './ExpenseRequest'
import Sidebar from './Sidebar'
import SubmitItems from './submitItems/SubmitItems'


const Proprietor = ({ manager }) => {
    const match = useMatch("/:manager/proprietor/*")
    console.log(match)
    return (
        <div style={{ display: 'flex', overflow: 'hidden' }}>

            <Sidebar match={match} />

            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>

                <Routes>
                    <Route path="/" element={<Navigate to={`${match.pathnameBase}/submititems`} />} />
                    <Route path={`/submititems`} element={<SubmitItems manager={manager} />} />
                    <Route path={`/expenserequest`} element={<ExpenseRequest manager={manager} />} />
                </Routes>
            </div>

        </div>
    )
}

export default Proprietor