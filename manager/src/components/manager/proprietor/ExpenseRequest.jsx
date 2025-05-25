import React, { useState } from 'react'
import { FormGroup, InputLabel, Input, FormControl } from '@mui/material'
import { raiseExpenseRequest } from '../../../api'
import CustomButton from '../../layouts/CustomButton'

const ExpenseRequest = ({ manager }) => {

    const [expense, setExpense] = useState({ amount: "", remarks: "" })

    const onSubmit = async () => {
        console.log(expense)

        const res = await raiseExpenseRequest(expense, manager.manager_id)
        console.log(res.data)
        setExpense({ amount: "", remarks: "" })

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


            <CustomButton buttonProps={{ style: { width: "100px", marginLeft: "100px", marginTop: "10px" }, variant: "contained", color: "primary" }} onClick={onSubmit}
                isInputValid={expense.remarks !== "" && expense.amount !== "" && expense.amount !== "0"}
                successMessage="Expense request raised successfully"
                errorMessage="Failed to raise expense request"
            >Raise</CustomButton>
        </FormGroup>
    )
}

export default ExpenseRequest