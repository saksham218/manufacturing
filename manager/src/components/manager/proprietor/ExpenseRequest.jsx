import React, { useState } from 'react'
import { FormGroup, InputLabel, Input, Button, FormControl } from '@mui/material'
import { raiseExpenseRequest } from '../../../api'


const ExpenseRequest = ({ manager }) => {

    const [expense, setExpense] = useState({ amount: "", remarks: "" })

    const onSubmit = async (e) => {
        e.preventDefault()
        console.log(expense)
        try {
            const res = await raiseExpenseRequest(expense, manager.manager_id)
            console.log(res.data)
            setExpense({ amount: "", remarks: "" })
        }
        catch (err) {
            console.log(err)

        }
    }

    return (
        <FormGroup style={{ width: "500px", padding: "20px" }}>
            <FormControl style={{ padding: "15px" }}>
                <InputLabel>Amount</InputLabel>
                <Input type="number" value={expense.amount}
                    inputProps={{ min: "0" }}
                    onChange={(e) => { setExpense({ ...expense, amount: e.target.value }); console.log(expense) }}
                    onWheel={(e) => { e.target.blur(); }}
                />
            </FormControl>
            <FormControl style={{ padding: "15px" }}>
                <InputLabel>Remarks</InputLabel>
                <Input value={expense.remarks} onChange={(e) => { setExpense({ ...expense, remarks: e.target.value }); console.log(expense) }} />
            </FormControl>


            <Button variant="contained" color="primary" style={{ width: "100px", marginLeft: "100px", marginTop: "10px" }} onClick={onSubmit}
                disabled={expense.remarks === "" || expense.amount === "" || expense.amount === "0"}>Raise</Button>
        </FormGroup>
    )
}

export default ExpenseRequest