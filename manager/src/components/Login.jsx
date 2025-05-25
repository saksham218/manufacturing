import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'

import { FormControl, InputLabel, Input, FormGroup, Typography } from '@mui/material'

import { loginManager } from '../api/index.js'
import CustomButton from './layouts/CustomButton'


const Login = () => {


    const navigate = useNavigate()
    const [credentials, setCredentials] = useState({ manager_id: "", password: "" })

    if (localStorage.getItem('manager')) {
        return <Navigate to={`/${JSON.parse(localStorage.getItem('manager')).manager_id}`} />
    }


    const onSubmit = async () => {
        console.log(credentials)
        const res = await loginManager(credentials)
        console.log(res.data)


        localStorage.setItem('manager', JSON.stringify({ name: res.data.result.name, manager_id: res.data.result.manager_id, proprietor_id: res.data.result.proprietor_id }))
        localStorage.setItem('manager_token', res.data.manager_token)

        navigate('/' + res.data.result.manager_id)

        setCredentials({ manager_id: "", password: "" })
    }
    return (
        <div style={{ padding: "20px" }}>
            <Typography variant="h4">Manager Login</Typography>
            <FormGroup style={{ width: "500px", padding: "20px" }}>

                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Id</InputLabel>
                    <Input value={credentials.manager_id} onChange={(e) => { setCredentials({ ...credentials, manager_id: e.target.value }); console.log(credentials); }} />
                </FormControl>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Password</InputLabel>
                    <Input value={credentials.password} onChange={(e) => { setCredentials({ ...credentials, password: e.target.value }); console.log(credentials); }} />
                </FormControl>
                <CustomButton
                    buttonProps={{ variant: "contained", color: "primary", style: { width: "100px", marginLeft: "100px" } }}
                    isInputValid={credentials.manager_id !== "" && credentials.password !== ""}
                    onClick={onSubmit}
                    successMessage="Login successful"
                    errorMessage="Login failed"
                >Login</CustomButton>
            </FormGroup>
        </div>
    )
}

export default Login