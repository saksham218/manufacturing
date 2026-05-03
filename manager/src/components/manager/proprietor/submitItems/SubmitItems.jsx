import React, { useEffect, useState } from 'react'
import { Typography, CircularProgress, Box } from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs'

import { getItemsForSubmitToProprietor } from '../../../../api'
import GroupedTable from '../../../layouts/GroupedTable'
import SubmitItemsForm from './components/SubmitItemsForm'

const SubmitItems = ({ manager }) => {

    const [submitDate, setSubmitDate] = useState(dayjs().format('DD/MM/YYYY'))
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])

    const fetchData = async (manager_id, submit_date) => {
        setLoading(true)
        try {
            const res = await getItemsForSubmitToProprietor(manager_id, dayjs(submit_date, 'DD/MM/YYYY').format('YYYY-MM-DD'))
            setData(res.data)
        } catch (err) {
            console.log(err)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData(manager.manager_id, submitDate)
    }, [manager, submitDate])

    const reloadDueBackward = () => fetchData(manager.manager_id, submitDate)

    const submitItemsFormComponent = {
        component: SubmitItemsForm,
        props: {
            reloadDueBackward: reloadDueBackward,
            manager: manager,
            submitDate: submitDate,
        },
        label: "submit"
    }


    return (
        <div>
            <Box style={{ display: "flex" }}>
                <Typography style={{ padding: "10px" }}>Submit To Proprietor on Date:</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        format='DD/MM/YYYY'
                        value={dayjs(submitDate, 'DD/MM/YYYY')}
                        onChange={(d) => { console.log(d); setSubmitDate(d.format('DD/MM/YYYY')) }}
                        maxDate={dayjs()}
                    />
                </LocalizationProvider>
            </Box>
            {loading ? <CircularProgress /> :
                (data && data.length > 0) ?
                    <GroupedTable data={data} groupKeys={['worker']} columns={['item', 'quantity', 'price', 'deduction_from_manager', 'remarks_from_manager', 'underprocessing_value', 'remarks_from_proprietor', 'info']} additionalComponents={[submitItemsFormComponent]} />
                    :
                    <Typography>No Data for Due Backward</Typography>
            }
        </div>
    )
}


export default SubmitItems