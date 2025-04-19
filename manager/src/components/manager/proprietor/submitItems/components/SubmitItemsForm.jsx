import React, { useState } from 'react'
import { Button, Input } from '@mui/material'

import { submitToProprietor } from '../../../../../api'

const SubmitItemsForm = ({ item, group, getItemsData, manager }) => {

    const [submitQuantity, setSubmitQuantity] = useState(0)

    const onSubmit = async (e, item, worker_id) => {
        try {
            const submission = {
                worker_id: worker_id,
                design_number: item.item.design_number,
                price: item.price,
                submit_quantity: submitQuantity,
                deduction_from_manager: item.deduction_from_manager,
                remarks_from_manager: item.remarks_from_manager,
                underprocessing_value: item.underprocessing_value,
                remarks_from_proprietor: item.remarks_from_proprietor,
                is_adhoc: item.is_adhoc,
                to_hold: item.to_hold,
            }
            console.log(submission)
            const res = await submitToProprietor(submission, manager.manager_id)


            console.log(res.data)
            setSubmitQuantity(0)
            await getItemsData()

        }
        catch (err) {
            console.log(err)
        }
    }

    const handleChange = (e) => {
        setSubmitQuantity(e.target.value);
        console.log(item)
        console.log(group)
        console.log(getItemsData)
        console.log(manager)
    }

    return (
        <>
            <Input type="number" placeholder='submit quantity' inputProps={{ min: 0, max: item.quantity }} style={{ width: "135px", marginRight: "10px" }}
                value={submitQuantity} onChange={handleChange}
                onWheel={(e) => { e.target.blur(); }}
            />

            <Button variant="contained" color="primary" onClick={(e) => { onSubmit(e, item, group.worker.worker_id) }}
                style={{ marginTop: "10px" }}
                disabled={submitQuantity < 1 || submitQuantity > item.quantity}>Submit</Button>
        </>
    )
}

export default SubmitItemsForm