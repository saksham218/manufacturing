import React from 'react'
import { useNavigate } from 'react-router-dom'

import { Typography, Box, Button } from '@mui/material'

const Header = ({ proprietor }) => {

    const navigate = useNavigate()

    const onLogout = () => {
        localStorage.removeItem('proprietor')
        localStorage.removeItem('proprietor_token')


        navigate('/login')
    }
    return (
        <div>
            <Box><Typography>Manufacturing</Typography>
                <Button onClick={onLogout}>Logout</Button></Box>
            <Typography>{proprietor.name}</Typography>
        </div>
    )
}

export default Header