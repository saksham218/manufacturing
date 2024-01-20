import React from 'react'
import { useMatch, useParams } from 'react-router'
import { Router, Routes, Route, Navigate } from 'react-router-dom'


import Header from './Header'
import Navbar from './Navbar'
import Manager from './manager/Manager'
import Item from './Item'


const Proprietor = ({ }) => {

    const params = useParams()
    // const { url, path } = useRouteMatch()
    const match = useMatch("/:proprietor/*")
    console.log(match)
    console.log(params)
    return (
        <div>
            <Header />

            <Navbar match={match} />
            <Routes>
                <Route path="/" element={<Navigate to={`${match.pathnameBase}/manager`} />} />
                <Route path={`/manager/*`} element={<Manager />} />
                <Route path={`/item`} element={<Item />} />
            </Routes>


        </div>
    )
}

export default Proprietor