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
            <Box style={{ display: 'flex', backgroundColor: "lightblue" }}>
                <Typography variant='h5'>Manufacturing</Typography>
                <Button style={{ marginLeft: "1000px", height: "30px", width: "80px" }} onClick={onLogout} variant="contained" color="primary">Logout</Button>
            </Box>
            <Typography variant="h6">Proprietor: {proprietor.name}</Typography>
        </div>
    )
}

export default Header