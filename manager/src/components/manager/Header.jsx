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
            <Box style={{ display: 'flex', backgroundColor: "lightblue", justifyContent: "space-between" }}>
                <Typography variant='h5' style={{ height: "50px", lineHeight: "50px", marginLeft: "10px", fontSize: "30px" }}>Manufacturing</Typography>
                <Button style={{ marginRight: "10px", height: "30px", width: "80px", marginTop: "10px" }} onClick={onLogout} variant="contained" color="primary">Logout</Button>
            </Box>
            <Typography variant='h6' style={{ marginTop: "10px", height: "30px", lineHeight: "20px", marginLeft: "10px", fontSize: "25px" }}>Manager: {manager.name}</Typography>
        </div>
    )
}

export default Header