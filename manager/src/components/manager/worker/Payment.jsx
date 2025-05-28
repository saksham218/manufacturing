import React, { useEffect, useState } from 'react'
import { FormControl, FormGroup, Input, InputLabel, Paper, Table, TableCell, TableRow, TableHead, Box, Typography, CircularProgress } from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs'

import { recordPayment, getPayments } from '../../../api'
import { useWorker } from './workerContext/WorkerContext'
import CustomButton from '../../layouts/CustomButton'

const Payment = () => {

    const { worker } = useWorker()

    const today = new Date()
    const emptyPayment = {
        amount: "",
        remarks: "",
        date: (today.getDate() < 10 ? "0" + today.getDate() : today.getDate()) + "/" + ((today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1)) + "/" + today.getFullYear()
    }
    const [payment, setPayment] = useState(emptyPayment)
    const [payments, setPayments] = useState([])
    const [dueAmount, setDueAmount] = useState(0)
    const [loading, setLoading] = useState(false)

    const getPaymentsData = async () => {
        try {
            setLoading(true)
            const res = await getPayments(worker.worker_id)
            return res.data
        }
        catch (err) {
            console.log(err)
        }
        finally {
            setLoading(false)
        }
    }

    useEffect(() => {

        let isMounted = true;

        console.log("get payments")
        console.log(worker)
        setPayment(emptyPayment)
        getPaymentsData().then((paymentsData) => {
            if (isMounted && paymentsData) {
                setPayments(paymentsData.payment_history)
                setDueAmount(paymentsData.due_amount)
            }
        })

        return () => { isMounted = false }
    }, [worker])


    const onSubmit = async () => {
        const res = await recordPayment(payment, worker.worker_id)
        console.log(res)
        setPayment(emptyPayment)
        const paymentsData = await getPaymentsData()
        setPayments(paymentsData.payment_history)
        setDueAmount(paymentsData.due_amount)

    }



    return (
        <div>
            <Box style={{ display: 'flex' }}>
                <Box style={{ width: "400px", marginTop: "20px" }}>
                    <FormGroup >
                        <FormControl style={{ marginTop: "15px", marginBottom: "15px" }}>
                            <InputLabel>Amount</InputLabel>
                            <Input type="number" value={payment.amount}
                                inputProps={{ min: "0" }}
                                onChange={(e) => { setPayment({ ...payment, amount: e.target.value }); console.log(payment); }}
                                onWheel={(e) => { e.target.blur(); }}
                            />
                        </FormControl>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker format='DD/MM/YYYY' value={dayjs(payment.date, 'DD/MM/YYYY')} onChange={(d) => { console.log(d); setPayment({ ...payment, date: d.format('DD/MM/YYYY') }); console.log(payment) }} />
                        </LocalizationProvider>
                        <FormControl style={{ marginTop: "15px" }}>
                            <InputLabel>Remarks</InputLabel>
                            <Input value={payment.remarks} onChange={(e) => { setPayment({ ...payment, remarks: e.target.value }); console.log(payment); }} />
                        </FormControl>
                        <CustomButton buttonProps={{ style: { width: "100px", marginLeft: "100px", marginTop: "10px" }, variant: "contained", color: "primary" }} onClick={onSubmit}
                            isInputValid={payment.amount !== "" && payment.remarks !== ""}
                            successMessage="Payment recorded successfully"
                            errorMessage="Failed to record payment"
                        >Record</CustomButton>
                    </FormGroup>
                </Box>
                <Box style={{ width: "600px", padding: "20px" }}>
                    {loading ? <CircularProgress style={{ marginTop: "50px", marginLeft: "200px" }} /> :
                        <>
                            <Typography>Due Amount: {dueAmount}</Typography>
                            <Typography>Payment History:</Typography>
                            <Box>
                                <Table container={Paper}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Amount</TableCell>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Remarks</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    {payments.map((p) => {

                                        const d = new Date(p.date);

                                        return (
                                            <TableRow>
                                                <TableCell>{p.amount}</TableCell>
                                                <TableCell>{d.getDate() < 10 ? ("0" + d.getDate()) : d.getDate()}/{d.getMonth() < 9 ? ("0" + (d.getMonth() + 1)) : (d.getMonth() + 1)}/{d.getFullYear()}</TableCell>
                                                <TableCell>{p.remarks}</TableCell>
                                            </TableRow>);
                                    })}

                                </Table>
                            </Box>
                        </>
                    }
                </Box>
            </Box>
        </div>
    )
}

export default Payment