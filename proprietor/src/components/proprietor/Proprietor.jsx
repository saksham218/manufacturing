import React, { useState } from 'react'
import { useMatch, useParams } from 'react-router'
import { Router, Routes, Route, Navigate } from 'react-router-dom'


import Header from './Header'
import Navbar from './Navbar'
import Manager from './manager/Manager'
import Item from './Item'


const Proprietor = () => {

    // const params = useParams()
    // const { url, path } = useRouteMatch()
    const match = useMatch("/:proprietor/*")
    const proprietor = localStorage.getItem('proprietor') ? JSON.parse(localStorage.getItem('proprietor')) : null;

    const [currentManager, setCurrentManager] = useState({})

    if (!proprietor) {
        return <Navigate to="/login" />
    }
    console.log(match)
    // console.log(params)
    return (
        <div>
            <Header proprietor={proprietor} />

            <Navbar match={match} />
            <Routes>
                <Route path="/" element={<Navigate to={`${match.pathnameBase}/manager`} />} />
                <Route path={`/manager/*`} element={<Manager proprietor={proprietor} currentManager={currentManager} setCurrentManager={setCurrentManager} />} />
                <Route path={`/item`} element={<Item proprietor={proprietor} />} />
            </Routes>


        </div>
    )
}

export default Proprietor