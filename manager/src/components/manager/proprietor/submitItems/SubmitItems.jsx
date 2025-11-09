import React, { useEffect, useState } from 'react'
import { Typography, CircularProgress, Box } from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs'

import { getItemsForFinalSubmit } from '../../../../api'
import ViewNestedTable from '../../../layouts/ViewNestedTable'
import { managerDetailsViewConfig } from '../../../constants/ViewConstants'
import SubmitItemsForm from './components/SubmitItemsForm'

const getItemsData = async (manager_id) => {
    try {
        const res = await getItemsForFinalSubmit(manager_id)
        console.log(res.data)

        return res.data

    }
    catch (err) {
        console.log(err)
    }
}

const SubmitItems = ({ manager }) => {

    const [dueBackward, setDueBackward] = useState([])
    const [firstNonEmptyIndex, setFirstNonEmptyIndex] = useState(-1)
    const [submitDate, setSubmitDate] = useState(dayjs().format('DD/MM/YYYY'))
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])

    useEffect(() => {
        setLoading(true)
        getItemsData(manager.manager_id).then((itemsData) => {
            setDueBackward(itemsData)
            setLoading(false)
        })
    }, [manager])

    useEffect(() => {
        const submitDateObj = dayjs(submitDate, 'DD/MM/YYYY')
        const filteredDueBackward = dueBackward.filter((group) => {
            const submitFromWorkerDateObj = dayjs(group.submit_from_worker_date)
            return submitFromWorkerDateObj.isBefore(submitDateObj, 'day') || submitFromWorkerDateObj.isSame(submitDateObj, 'day')
        })
        setData(filteredDueBackward)
        const fNEI = filteredDueBackward.findIndex((dt) => dt.items.length > 0)
        setFirstNonEmptyIndex(fNEI)
    }, [submitDate, dueBackward])

    const reloadDueBackward = async () => {
        const itemsData = await getItemsData(manager.manager_id)
        setDueBackward(itemsData)
    }

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
                <Typography style={{ padding: "10px" }}>Submit Date:</Typography>
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
                (data && data.length > 0 && firstNonEmptyIndex !== -1) ?
                    <ViewNestedTable data={data} groupingKeys={managerDetailsViewConfig["due_backward"].grouping_keys} keys={managerDetailsViewConfig['due_backward'].keys} additionalComponents={[submitItemsFormComponent]} />
                    :
                    <Typography>No Data for Due Backward</Typography>
            }
        </div>
    )
}


export default SubmitItems