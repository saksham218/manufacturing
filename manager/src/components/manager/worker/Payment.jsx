import React, { useEffect, useState } from 'react'
import { Button, FormControl, FormGroup, Input, InputLabel, Paper, Table, TableCell, TableRow, TableHead, Box, Typography } from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs'

import { recordPayment, getPayments } from '../../../api'
import { useWorker } from './workerContext/WorkerContext'

const Payment = () => {

    const { worker } = useWorker()

    const today = new Date()
    const [payment, setPayment] = useState({ amount: "", remarks: "", date: (today.getDate() < 10 ? "0" + today.getDate() : today.getDate()) + "/" + ((today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1)) + "/" + today.getFullYear() })
    const [payments, setPayments] = useState([])
    const [dueAmount, setDueAmount] = useState(0)

    const getPaymentsData = async () => {
        try {
            const res = await getPayments(worker.worker_id)
            return res.data
        }
        catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {

        let isMounted = true;

        console.log("get payments")
        console.log(worker)
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
        setPayment({ amount: "", remarks: "", date: (today.getDate() < 10 ? "0" + today.getDate() : today.getDate()) + "/" + ((today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1)) + "/" + today.getFullYear() })
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
                        <Button variant="contained" color="primary" style={{ width: "100px", marginLeft: "100px", marginTop: "10px" }} onClick={onSubmit}
                            disabled={payment.amount === "" || payment.remarks === ""}>Record</Button>
                    </FormGroup>
                </Box>
                <Box style={{ width: "600px", padding: "20px" }}>
                    <Typography>Due Amount: {dueAmount}</Typography>
                    <Typography>Payment History:</Typography>
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
            </Box>
        </div>
    )
}

export default Payment