import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, FormGroup, FormControl, InputLabel, Input, Button } from '@mui/material'

import { createProprietor } from '../api/index.js'



const Signup = ({ setProprietor }) => {

    const navigate = useNavigate()

    const [newProprietor, setNewProprietor] = useState({ name: "", proprietor_id: "", password: "" })
    const [confirmPassword, setConfirmPassword] = useState("")

    const onSubmit = async () => {
        console.log(newProprietor)
        //submit to backend
        const res = await createProprietor(newProprietor)
        console.log(res.data.result)


        setProprietor({ name: res.data.result.name, proprietor_id: res.data.result.proprietor_id })
        setNewProprietor({ name: "", id: "", password: "" })
        setConfirmPassword("")
        navigate('/' + res.data.result.proprietor_id)
    }

    return (
        <div>
            <Typography variant="h4">Signup</Typography>
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


        </div>
    )
}

export default Signup