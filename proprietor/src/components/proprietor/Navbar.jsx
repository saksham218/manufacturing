import React, { useState, useEffect } from 'react'
import { AppBar, Toolbar, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

import './Navbar.css'

const Navbar = ({ match }) => {

    const navigate = useNavigate()
    const [option, setOption] = useState("")

    useEffect(() => {
        setOption(match.pathname.split("/")[2])
    }, [match])

    return (
        <div>
            <AppBar position="static" style={{ boxShadow: 'none' }}>
                <Toolbar className='navbar'>
                    <Button className={option === 'manager' ? "selected" : ""} color="inherit" onClick={() => { navigate(`${match.pathnameBase}/manager`); setOption("manager"); }}>Manager</Button>
                    <Button className={option === 'item' ? "selected" : ""} color="inherit" onClick={() => { navigate(`${match.pathnameBase}/item`); setOption("item"); }}>Items</Button>
                </Toolbar>
            </AppBar>
        </div>
    )
}

export default Navbar
