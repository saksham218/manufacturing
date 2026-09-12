import React, { useEffect, useState } from 'react'
import { Typography, Box } from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs'

import { getItemsForSubmitToProprietor } from '../../../../api'
import GroupedTable from '../../../layouts/GroupedTable'
import SubmitItemsForm from './components/SubmitItemsForm'
import { useApp } from '../../../AppContext'

const getSubmitItemsData = async (manager_id, submit_date) => {
    try {
        const res = await getItemsForSubmitToProprietor(manager_id, dayjs(submit_date, 'DD/MM/YYYY').format('YYYY-MM-DD'))
        return res.data
    } catch (err) {
        console.log(err)
    }
}

const SubmitItems = ({ manager }) => {

    const { actionsVersion } = useApp()
    const [submitDate, setSubmitDate] = useState(dayjs().format('DD/MM/YYYY'))
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])

    useEffect(() => {
        let isMounted = true

        setLoading(true)
        getSubmitItemsData(manager.manager_id, submitDate).then((items) => {
            if (items && isMounted) {
                setData(items)
                setLoading(false)
            }
        })

        return () => { isMounted = false }
    }, [manager, submitDate, actionsVersion])

    const submitItemsFormComponent = {
        component: SubmitItemsForm,
        props: {
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
            <GroupedTable
                loading={loading}
                data={data}
                groupKeys={['worker']}
                columns={['item', 'quantity', 'price', 'deduction_from_manager', 'remarks_from_manager', 'underprocessing_value', 'remarks_from_proprietor', 'info']}
                additionalComponents={[submitItemsFormComponent]}
                noDataMessage="No Data for Due Backward"
            />
        </div>
    )
}


export default SubmitItems
