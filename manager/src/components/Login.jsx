import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'

import { FormControl, InputLabel, Input, Button, FormGroup, Typography } from '@mui/material'

import { loginManager } from '../api/index.js'


const Login = () => {


    const navigate = useNavigate()
    const [credentials, setCredentials] = useState({ manager_id: "", password: "" })

    if (localStorage.getItem('manager')) {
        return <Navigate to={`/${JSON.parse(localStorage.getItem('manager')).manager_id}`} />
    }


    const onSubmit = async () => {
        console.log(credentials)

        try {
            const res = await loginManager(credentials)
            console.log(res.data)


            localStorage.setItem('manager', JSON.stringify({ name: res.data.result.name, manager_id: res.data.result.manager_id }))
            localStorage.setItem('manager_token', res.data.manager_token)

            navigate('/' + res.data.result.manager_id)

            setCredentials({ manager_id: "", password: "" })


        }
        catch (err) {
            console.log(err)
        }




    }
    return (
        <div>
            <Typography variant="h4">Login</Typography>
            <FormGroup style={{ width: "500px", padding: "20px" }}>

                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Id</InputLabel>
                    <Input value={credentials.manager_id} onChange={(e) => { setCredentials({ ...credentials, manager_id: e.target.value }); console.log(credentials); }} />
                </FormControl>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Password</InputLabel>
                    <Input value={credentials.password} onChange={(e) => { setCredentials({ ...credentials, password: e.target.value }); console.log(credentials); }} />
                </FormControl>
                <Button variant="contained" color="primary" style={{ width: "100px", marginLeft: "100px" }}
                    disabled={credentials.manager_id === "" ||
                        credentials.password === ""}

                    onClick={onSubmit}>Login</Button>
            </FormGroup>
        </div>
    )
}

export default Login