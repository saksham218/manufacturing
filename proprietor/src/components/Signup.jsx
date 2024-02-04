import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Typography, FormGroup, FormControl, InputLabel, Input, Button } from '@mui/material'

import { createProprietor } from '../api/index.js'



const Signup = () => {

    const navigate = useNavigate()

    const [newProprietor, setNewProprietor] = useState({ name: "", proprietor_id: "", password: "" })
    const [confirmPassword, setConfirmPassword] = useState("")

    if (localStorage.getItem('proprietor')) {
        return <Navigate to={`/${JSON.parse(localStorage.getItem('proprietor')).proprietor_id}`} />
    }

    const onSubmit = async () => {
        console.log(newProprietor)
        //submit to backend
        const res = await createProprietor(newProprietor)
        console.log(res.data.result)


        localStorage.setItem('proprietor', JSON.stringify({ name: res.data.result.name, proprietor_id: res.data.result.proprietor_id }))
        localStorage.setItem('proprietor_token', res.data.proprietor_token)
        navigate('/' + res.data.result.proprietor_id)

        setNewProprietor({ name: "", id: "", password: "" })
        setConfirmPassword("")
    }

    return (
        <div style={{ padding: "20px" }}>
            <Typography variant="h4">Proprietor Signup</Typography>
            <FormGroup style={{ width: "500px", padding: "20px" }}>


                <FormControl style={{ padding: "15px" }}>
                    <InputLabel >Name</InputLabel>
                    <Input value={newProprietor.name} onChange={(e) => { setNewProprietor({ ...newProprietor, name: e.target.value }); console.log(newProprietor); }} />

                </FormControl>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Id</InputLabel>
                    <Input value={newProprietor.proprietor_id} onChange={(e) => { setNewProprietor({ ...newProprietor, proprietor_id: e.target.value }); console.log(newProprietor); }} />
                </FormControl>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Password</InputLabel>
                    <Input value={newProprietor.password} onChange={(e) => { setNewProprietor({ ...newProprietor, password: e.target.value }); console.log(newProprietor); }} />
                </FormControl>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Confirm Password</InputLabel>
                    <Input value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); console.log(confirmPassword) }} />
                </FormControl>
                <Button variant="contained" color="primary" style={{ width: "100px", marginLeft: "100px" }}
                    disabled={newProprietor.proprietor_id === "" ||
                        newProprietor.name === "" ||
                        newProprietor.password === "" ||
                        confirmPassword !== newProprietor.password}

                    onClick={onSubmit}>Signup</Button>

            </FormGroup>

            <Typography style={{ paddingLeft: "80px" }}>Proprietor already registered? <Button style={{ textDecoration: "underline" }} onClick={() => { navigate('/login'); }}>Login</Button></Typography>
        </div >
    )
}

export default Signup