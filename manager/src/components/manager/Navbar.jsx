import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Button } from '@mui/material'

import './Navbar.css'

const Navbar = ({ match }) => {

    const navigate = useNavigate();
    const [option, setOption] = useState("view")

    return (
        <div>
            <AppBar position="static" style={{ boxShadow: 'none' }}>
                <Toolbar className="navbar">
                    <Button className={option === "view" ? "selected" : ""} color="inherit" onClick={() => { navigate(`${match.pathnameBase}/view`); setOption("view"); }}>View</Button>
                    <Button className={option === "worker" ? "selected" : ""} color="inherit" onClick={() => { navigate(`${match.pathnameBase}/worker`); setOption("worker"); }}>Worker</Button>
                    <Button className={option === "proprietor" ? "selected" : ""} color="inherit" onClick={() => { navigate(`${match.pathnameBase}/proprietor`); setOption("proprietor"); }}>Proprietor</Button>
                </Toolbar>
            </AppBar>
        </div>
    )
}

export default Navbar