import React from 'react'
import { Link } from 'react-router-dom'
import { AppBar, Toolbar, Button } from '@mui/material'



const Navbar = ({ match }) => {
    return (
        <div>
            <AppBar position="static" style={{ boxShadow: 'none' }}>
                <Toolbar>
                    <Button color="inherit" component={Link} to={`${match.pathnameBase}/view`}>View</Button>
                    <Button color="inherit" component={Link} to={`${match.pathnameBase}/worker`}>Worker</Button>
                    <Button color="inherit" component={Link} to={`${match.pathnameBase}/proprietor`}>Proprietor</Button>
                </Toolbar>
            </AppBar>
        </div>
    )
}

export default Navbar