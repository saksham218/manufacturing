import React from 'react'

import { useNavigate } from 'react-router-dom'

import { Typography, Box, Button } from '@mui/material'

const Header = ({ manager }) => {

    const navigate = useNavigate()

    const onLogout = () => {
        localStorage.removeItem('manager')
        localStorage.removeItem('manager_token')


        navigate('/login')
    }
    return (
        <div>
            <Box>
                <Typography>Manufacturing</Typography>
                <Button onClick={onLogout}>Logout</Button>
            </Box>
            <Typography>{manager.name}</Typography>
        </div>
    )
}

export default Header