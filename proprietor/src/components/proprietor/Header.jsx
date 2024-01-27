import React from 'react'
import { Link } from 'react-router-dom'

import { Typography, Box, Button } from '@mui/material'

const Header = ({ proprietor }) => {
    return (
        <div>
            <Box><Typography>Manufacturing</Typography><Button component={Link} to={`/login`}>Logout</Button></Box>
            <Typography>{proprietor.name}</Typography>
        </div>
    )
}

export default Header