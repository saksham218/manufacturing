import React from 'react'
import { Link } from 'react-router-dom'

import { Typography, Box, Button } from '@mui/material'

const Header = ({ manager }) => {
    return (
        <div>
            <Box><Typography>Manufacturing</Typography><Button component={Link} to={`/login`}>Logout</Button></Box>
            <Typography>{manager.name}</Typography>
        </div>
    )
}

export default Header