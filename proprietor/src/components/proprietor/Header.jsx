import React from 'react'

import { Typography, Box, Button } from '@mui/material'

const Header = ({ proprietor }) => {
    return (
        <div>
            <Box><Typography>Manufacturing</Typography><Button>Logout</Button></Box>
            <Typography>{proprietor.name}</Typography>
        </div>
    )
}

export default Header