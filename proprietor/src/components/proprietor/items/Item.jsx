import React from 'react'
import { Navigate, Route, Routes, useMatch } from 'react-router-dom'

import CreateItem from './CreateItem.jsx'
import OnHoldItems from './OnHoldItems.jsx'
import Sidebar from './Sidebar.jsx'


const Item = ({ proprietor }) => {

    const match = useMatch("/:proprietor/item/*")
    console.log(match)

    return (
        <div style={{ display: 'flex', overflow: 'hidden' }}>
            <Sidebar match={match} />
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>

                <Routes>
                    <Route path="/" element={<Navigate to={`${match.pathnameBase}/createitem`} />} />
                    <Route path={`/createitem`} element={<CreateItem proprietor={proprietor} />} />
                    <Route path={`/onholditems`} element={<OnHoldItems proprietor={proprietor} />} />
                </Routes>
            </div>
        </div>
    )
}

export default Item