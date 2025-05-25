import React, { useState } from 'react'

import { Input, InputLabel, FormControl, FormGroup } from '@mui/material'
import { addManager } from '../../../api'
import CustomButton from '../../layouts/CustomButton'

const AddManager = ({ proprietor, setManagersList }) => {

    const [newManager, setNewManager] = useState({ name: "", contact_number: "", address: "", manager_id: "", password: "" })
    const [confirmPassword, setConfirmPassword] = useState("")

    const onSubmit = async () => {
        console.log(newManager)
        const res = await addManager(newManager, proprietor.proprietor_id)
        console.log(res)
        setManagersList();
        setNewManager({ name: "", contact_number: "", address: "", manager_id: "", password: "" })
        setConfirmPassword("")

    }
    return (
        <div>
            <FormGroup style={{ width: "500px", padding: "20px" }}>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Name</InputLabel>
                    <Input value={newManager.name} onChange={(e) => { setNewManager({ ...newManager, name: e.target.value }); console.log(newManager); }} />
                </FormControl>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel type="number">Contact No.</InputLabel>
                    <Input value={newManager.contact_number} onChange={(e) => { setNewManager({ ...newManager, contact_number: e.target.value }); console.log(newManager); }} />
                </FormControl>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Address</InputLabel>
                    <Input value={newManager.address} onChange={(e) => { setNewManager({ ...newManager, address: e.target.value }); console.log(newManager); }} />
                </FormControl>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Manager ID</InputLabel>
                    <Input value={newManager.manager_id} onChange={(e) => { setNewManager({ ...newManager, manager_id: e.target.value }); console.log(newManager); }} />
                </FormControl>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Password</InputLabel>
                    <Input value={newManager.password} onChange={(e) => { setNewManager({ ...newManager, password: e.target.value }); console.log(newManager); }} />
                </FormControl>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Confirm Password</InputLabel>
                    <Input value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); console.log(confirmPassword); }} />
                </FormControl>
                <CustomButton buttonProps={{ variant: "contained", color: "primary", style: { width: "100px", marginLeft: "100px" } }}
                    isInputValid={newManager.name !== "" &&
                        newManager.contact_number !== "" &&
                        newManager.address !== "" &&
                        newManager.manager_id !== "" &&
                        newManager.password !== "" &&
                        confirmPassword === newManager.password
                    }

                    onClick={onSubmit}
                    successMessage="Manager added successfully"
                    errorMessage="Failed to add manager"
                >Add</CustomButton>
            </FormGroup></div>
    )
}

export default AddManager