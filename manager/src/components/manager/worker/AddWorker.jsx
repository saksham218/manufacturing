import React, { useState } from 'react'

import { Input, InputLabel, FormControl, FormGroup } from '@mui/material'
import { addWorker } from '../../../api'
import CustomButton from '../../layouts/CustomButton'

const AddWorker = ({ manager, setWorkersList }) => {

    const [newWorker, setNewWorker] = useState({ name: "", contact_number: "", address: "", worker_id: "" })


    const onSubmit = async () => {
        console.log(newWorker)
        const res = await addWorker(newWorker, manager.manager_id)
        console.log(res)
        setWorkersList();
        setNewWorker({ name: "", contact_number: "", address: "", worker_id: "" })

    }
    return (
        <div>
            <FormGroup style={{ width: "500px", padding: "20px" }}>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Name</InputLabel>
                    <Input value={newWorker.name} onChange={(e) => { setNewWorker({ ...newWorker, name: e.target.value }); console.log(newWorker); }} />
                </FormControl>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel type="number">Contact No.</InputLabel>
                    <Input value={newWorker.contact_number} onChange={(e) => { setNewWorker({ ...newWorker, contact_number: e.target.value }); console.log(newWorker); }} />
                </FormControl>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Address</InputLabel>
                    <Input value={newWorker.address} onChange={(e) => { setNewWorker({ ...newWorker, address: e.target.value }); console.log(newWorker); }} />
                </FormControl>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Worker ID</InputLabel>
                    <Input value={newWorker.worker_id} onChange={(e) => { setNewWorker({ ...newWorker, worker_id: e.target.value }); console.log(newWorker); }} />
                </FormControl>

                <CustomButton
                    buttonProps={{ variant: "contained", color: "primary", style: { width: "100px", marginLeft: "100px" } }}
                    isInputValid={newWorker.name !== "" &&
                        newWorker.contact_number !== "" &&
                        newWorker.address !== "" &&
                        newWorker.worker_id !== ""
                    }
                    onClick={onSubmit}
                    successMessage="Worker added successfully"
                    errorMessage="Failed to add worker"
                >Add</CustomButton>
            </FormGroup></div>
    )
}

export default AddWorker