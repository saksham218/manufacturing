import React, { useState, useEffect } from 'react'
import { FormControl, FormGroup, Input, InputLabel, MenuItem, Select } from '@mui/material'
import dayjs from 'dayjs'

import { acceptFromManager } from '../../../../../api'
import CustomButton from '../../../../layouts/CustomButton'
import { useApp } from '../../../../AppContext'

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

const AcceptForm = ({ item, manager, actionDate }) => {

    const { onMutation } = useApp()
    const [quantity, setQuantity] = useState("")
    const [deduction, setDeduction] = useState("")
    const [finalRemarks, setFinalRemarks] = useState("")
    const [partialPayment, setPartialPayment] = useState("")
    const [actionIndex, setActionIndex] = useState(0)
    const [penalty, setPenalty] = useState("")

    const onSubmit = async () => {

        const accepted = {
            action: actions[actionIndex].name,
            worker_id: item.worker.worker_id,
            design_number: item.item.design_number,
            quantity: quantity,
            price: item.price,
            partial_payment: partialPayment,
            deduction_from_manager: item.deduction_from_manager,
            remarks_from_manager: item.remarks_from_manager,
            underprocessing_value: item.underprocessing_value,
            remarks_from_proprietor: item.remarks_from_proprietor,
            deduction: deduction,
            penalty: penalty,
            final_remarks: finalRemarks,
            is_adhoc: item.is_adhoc,
            to_hold: item.to_hold,
            action_date: dayjs(actionDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            submit_to_proprietor_date: dayjs(item.submit_to_proprietor_date).format('YYYY-MM-DD'),
            hold_info: item.hold_info
        }
        console.log(accepted)

        const res = await acceptFromManager(accepted, manager.manager_id)
        console.log(res.data)
        setQuantity("")
        setDeduction("")
        setPenalty("")
        setFinalRemarks("")
        setPartialPayment("")
        setActionIndex(0)
        onMutation()

    }

    useEffect(() => {
        setQuantity("")
        setDeduction("")
        setFinalRemarks("")
        setPartialPayment("")

        if (actions[actionIndex].name === "forfeit") {
            setPenalty(`${item.underprocessing_value}`)
        }
        else {
            setPenalty("")
        }
    }, [actionIndex])

    return (
        <FormGroup onClick={(e) => { e.stopPropagation() }} style={{ flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
                <FormControl variant="standard">
                    <InputLabel>Action</InputLabel>
                    <Select value={actionIndex} onChange={(e) => { setActionIndex(e.target.value) }} style={{ width: "150px", marginTop: "16px" }}>
                        {actions.map((act, index) => (
                            <MenuItem key={act.name} value={index}>
                                {act.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl variant="standard">
                    <InputLabel>Quantity</InputLabel>
                    <Input type="number" inputProps={{ min: 0, max: item.quantity }} style={{ width: "100px" }} value={quantity}
                        onChange={(e) => { setQuantity(e.target.value) }}
                        onWheel={(e) => { e.target.blur(); }}
                    />
                </FormControl>

                <div style={{ width: "130px" }}>
                    {actions[actionIndex].name === "accept" &&
                        <FormControl variant="standard" style={{ width: "100%" }}>
                            <InputLabel>Deduction</InputLabel>
                            <Input type="number" inputProps={{ min: 0, max: (Number(item.price) - Number(item.deduction_from_manager)) }} style={{ width: "100%" }} value={deduction}
                                onChange={(e) => { setDeduction(e.target.value) }}
                                onWheel={(e) => { e.target.blur(); }}
                            />
                        </FormControl>
                    }
                    {actions[actionIndex].name === "hold" &&
                        <FormControl variant="standard" style={{ width: "100%" }}>
                            <InputLabel>Partial Payment</InputLabel>
                            <Input type="number" inputProps={{ min: 0, max: (Number(item.price) - Number(item.deduction_from_manager)) }} style={{ width: "100%" }} value={partialPayment}
                                onChange={(e) => { setPartialPayment(e.target.value) }}
                                onWheel={(e) => { e.target.blur(); }}
                            />
                        </FormControl>
                    }
                    {actions[actionIndex].name === "forfeit" &&
                        <FormControl variant="standard" style={{ width: "100%" }}>
                            <InputLabel>Penalty</InputLabel>
                            <Input type="number" inputProps={{ min: 0, max: (Number(item.underprocessing_value)) }} style={{ width: "100%" }} value={penalty}
                                onChange={(e) => { setPenalty(e.target.value) }}
                                onWheel={(e) => { e.target.blur(); }}
                            />
                        </FormControl>
                    }
                </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
                <FormControl variant="standard">
                    <InputLabel>Final Remarks</InputLabel>
                    <Input type="text" style={{ width: "150px" }} value={finalRemarks}
                        onChange={(e) => { setFinalRemarks(e.target.value) }}
                    />
                </FormControl>

                <CustomButton
                    buttonProps={{ variant: "contained", color: "primary", style: { height: "25px", width: "35px", fontSize: "12px" } }}
                    isInputValid={Number(quantity) > 0 && Number(quantity) <= Number(item.quantity) &&
                        Number(deduction) <= (Number(item.price) - Number(item.deduction_from_manager)) &&
                        (actions[actionIndex].name !== "forfeit" || (Number(penalty) <= Number(item.underprocessing_value) && Number(penalty) > 0)) &&
                        ((Number(deduction) === 0 && actions[actionIndex].name === "accept") || finalRemarks !== "")}
                    onClick={onSubmit}
                    successMessage="Action successful"
                    errorMessage="Action failed"
                >
                    Done
                </CustomButton>
            </div>
        </FormGroup>
    )
}

export default AcceptForm