import React, { useState, useEffect } from 'react'
import { FormControl, FormGroup, Input, InputLabel, MenuItem, Select } from '@mui/material'

import { acceptFromManager } from '../../../../../api'
import CustomButton from '../../../../layouts/CustomButton'

const actions = [
    {
        label: "Accept",
        name: "accept",
    },
    {
        label: "Forfeit",
        name: "forfeit",
    },
    {
        label: "Hold",
        name: "hold",
    }
]

const AcceptForm = ({ group, item, reloadSubmissionsData, manager }) => {

    const [quantity, setQuantity] = useState("")
    const [deduction, setDeduction] = useState("")
    const [finalRemarks, setFinalRemarks] = useState("")
    const [partialPayment, setPartialPayment] = useState("")
    const [actionIndex, setActionIndex] = useState(0)

    const onSubmit = async () => {

        const accepted = {
            action: actions[actionIndex].name,
            worker_id: group.worker.worker_id,
            design_number: item.item.design_number,
            quantity: quantity,
            price: item.price,
            partial_payment: partialPayment,
            deduction_from_manager: item.deduction_from_manager,
            remarks_from_manager: item.remarks_from_manager,
            underprocessing_value: item.underprocessing_value,
            remarks_from_proprietor: item.remarks_from_proprietor,
            deduction: deduction,
            final_remarks: finalRemarks,
            is_adhoc: item.is_adhoc,
            to_hold: item.to_hold,
            hold_info: item.hold_info
        }
        console.log(accepted)

        const res = await acceptFromManager(accepted, manager.manager_id)
        console.log(res.data)
        setQuantity("")
        setDeduction("")
        setFinalRemarks("")
        setPartialPayment("")
        setActionIndex(0)
        reloadSubmissionsData();

    }

    useEffect(() => {
        setQuantity("")
        setDeduction("")
        setFinalRemarks("")
        setPartialPayment("")
    }, [actionIndex])

    return (
        <>
            <FormGroup onClick={(e) => { e.stopPropagation() }}>
                <FormControl >
                    <InputLabel>Action</InputLabel>
                    <Select value={actionIndex} onChange={(e) => { setActionIndex(e.target.value) }} style={{ marginTop: "10px", width: "150px" }}>
                        {actions.map((act, index) => (
                            <MenuItem key={act.name} value={index}>
                                {act.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>


                <FormControl style={{ marginTop: "10px" }}>
                    <InputLabel>Quantity</InputLabel>
                    <Input type="number" inputProps={{ min: 0, max: item.quantity }} style={{ marginTop: "10px", width: "150px" }} value={quantity}
                        onChange={(e) => { setQuantity(e.target.value) }}
                        onWheel={(e) => { e.target.blur(); }}
                    />
                </FormControl>

                {
                    actions[actionIndex].name === "accept" ?
                        <FormControl style={{ marginTop: "10px" }}>
                            <InputLabel>Deduction</InputLabel>
                            <Input type="number" inputProps={{ min: 0, max: (Number(item.price) - Number(item.deduction_from_manager)) }} style={{ marginTop: "10px", width: "150px" }} value={deduction}
                                onChange={(e) => { setDeduction(e.target.value) }}
                                onWheel={(e) => { e.target.blur(); }}
                            />
                        </FormControl> : null
                }

                {
                    actions[actionIndex].name === "hold" ?
                        <FormControl style={{ marginTop: "10px" }}>
                            <InputLabel>Partial Payment</InputLabel>
                            <Input type="number" inputProps={{ min: 0, max: (Number(item.price) - Number(item.deduction_from_manager)) }} style={{ marginTop: "10px", width: "150px" }} value={partialPayment}
                                onChange={(e) => { setPartialPayment(e.target.value) }}
                                onWheel={(e) => { e.target.blur(); }}
                            />
                        </FormControl> : null
                }

                <FormControl style={{ marginTop: "10px" }}>
                    <InputLabel>Final Remarks</InputLabel>
                    <Input type="text" style={{ marginTop: "10px", width: "150px" }} value={finalRemarks}
                        onChange={(e) => { setFinalRemarks(e.target.value) }}
                    />
                </FormControl>


                <CustomButton
                    buttonProps={{ variant: "contained", color: "primary", style: { marginTop: "10px", height: "25px", width: "35px", fontSize: "12px" } }}
                    isInputValid={Number(quantity) > 0 && Number(quantity) <= Number(item.quantity) &&
                        Number(deduction) <= (Number(item.price) - Number(item.deduction_from_manager)) && Number(partialPayment) <= (Number(item.price) - Number(item.deduction_from_manager)) &&
                        ((Number(deduction) === 0 && actions[actionIndex].name !== "hold" && actions[actionIndex].name !== "forfeit") || finalRemarks !== "")}
                    onClick={onSubmit}
                    successMessage="Action successful"
                    errorMessage="Action failed"
                >
                    Done
                </CustomButton>

            </FormGroup >
        </>
    )
}

export default AcceptForm