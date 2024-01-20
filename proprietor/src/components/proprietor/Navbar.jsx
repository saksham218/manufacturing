import React from 'react'

import { AppBar, Toolbar, Typography, Button } from '@mui/material'
import { Link } from 'react-router-dom'

const Navbar = ({ match }) => {
    console.log(match)
    return (
        <div>

            <AppBar position="static" style={{ boxShadow: 'none' }}>
                <Toolbar>
                    <Button color="inherit" component={Link} to={`${match.pathnameBase}/manager`}>Manager</Button>
                    <Button color="inherit" component={Link} to={`${match.pathnameBase}/item`}>Items</Button>
                </Toolbar>
            </AppBar>
        </div>
    )
}

export default Navbar