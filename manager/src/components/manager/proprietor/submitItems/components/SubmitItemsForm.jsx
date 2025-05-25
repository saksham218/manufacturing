import React, { useState } from 'react'
import { Input } from '@mui/material'
import CustomButton from '../../../../layouts/CustomButton'
import { submitToProprietor } from '../../../../../api'

const SubmitItemsForm = ({ item, group, getItemsData, manager }) => {

    const [submitQuantity, setSubmitQuantity] = useState("")

    const onSubmit = async () => {

        const submission = {
            worker_id: group.worker.worker_id,
            design_number: item.item.design_number,
            price: item.price,
            submit_quantity: submitQuantity,
            deduction_from_manager: item.deduction_from_manager,
            remarks_from_manager: item.remarks_from_manager,
            underprocessing_value: item.underprocessing_value,
            remarks_from_proprietor: item.remarks_from_proprietor,
            is_adhoc: item.is_adhoc,
            to_hold: item.to_hold,
            hold_info: item.hold_info
        }
        console.log(submission)
        const res = await submitToProprietor(submission, manager.manager_id)


        console.log(res.data)
        setSubmitQuantity("")
        await getItemsData()

    }

    const handleChange = (e) => {
        setSubmitQuantity(e.target.value);
    }

    return (
        <>
            <Input type="number" placeholder='Quantity' inputProps={{ min: 0, max: item.quantity }} style={{ width: "135px", marginRight: "10px" }}
                value={submitQuantity} onChange={handleChange}
                onClick={(e) => { e.stopPropagation() }}
                onWheel={(e) => { e.target.blur(); }}
            />

            <CustomButton buttonProps={{ style: { marginTop: "10px" }, variant: "contained", color: "primary" }} onClick={onSubmit}
                isInputValid={Number(submitQuantity) >= 1 && Number(submitQuantity) <= Number(item.quantity)}
                successMessage="Item submitted successfully"
                errorMessage="Failed to submit item"
            >Submit</CustomButton>
        </>
    )
}

export default SubmitItemsForm