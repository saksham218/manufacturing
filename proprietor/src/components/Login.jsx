import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { FormControl, InputLabel, Input, Button, FormGroup, Typography } from '@mui/material'

import { loginProprietor } from '../api/index.js'


const Login = () => {

    const navigate = useNavigate()
    const [credentials, setCredentials] = useState({ proprietor_id: "", password: "" })

    if (localStorage.getItem('proprietor')) {
        return <Navigate to={`/${JSON.parse(localStorage.getItem('proprietor')).proprietor_id}`} />
    }

    const onSubmit = async () => {
        console.log(credentials)

        try {
            const res = await loginProprietor(credentials)
            console.log(res.data.result)
            localStorage.setItem('proprietor', JSON.stringify({ name: res.data.result.name, proprietor_id: res.data.result.proprietor_id }))
            localStorage.setItem('proprietor_token', res.data.proprietor_token)

            navigate('/' + res.data.result.proprietor_id)
            setCredentials({ proprietor_id: "", password: "" })



        }
        catch (err) {
            console.log(err)
        }




    }
    return (
        <div style={{ padding: "20px" }}>
            <Typography variant="h4">Proprietor Login</Typography>
            <FormGroup style={{ width: "500px", padding: "20px" }}>

                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Id</InputLabel>
                    <Input value={credentials.proprietor_id} onChange={(e) => { setCredentials({ ...credentials, proprietor_id: e.target.value }); console.log(credentials); }} />
                </FormControl>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Password</InputLabel>
                    <Input value={credentials.password} onChange={(e) => { setCredentials({ ...credentials, password: e.target.value }); console.log(credentials); }} />
                </FormControl>
                <Button variant="contained" color="primary" style={{ width: "100px", marginLeft: "100px" }}
                    disabled={credentials.proprietor_id === "" ||
                        credentials.password === ""}

                    onClick={onSubmit}>Login</Button>
            </FormGroup>
            <Typography style={{ paddingLeft: "80px" }}>New Proprietor? <Button style={{ textDecoration: "underline" }} onClick={() => { navigate('/signup'); }}>Signup</Button></Typography>
        </div>
    )
}

export default Login