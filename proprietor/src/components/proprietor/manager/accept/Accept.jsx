import React, { useState } from 'react'
import { Typography, CircularProgress, Box } from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs'

import { useEffect } from 'react'
import { getSubmissions } from '../../../../api'
import { useManager } from '../managerContext/ManagerContext'
import AcceptForm from './components/AcceptForm'
import { managerDetailsViewConfig } from '../../../constants/ViewConstants'
import ViewNestedTable from '../../../layouts/ViewNestedTable'

const getSubmissionsData = async (manager_id) => {
    try {
        const res = await getSubmissions(manager_id);
        console.log(res.data)

        return res.data;
    }
    catch (err) {
        console.log(err)
    }
}

const Accept = () => {

    const { manager } = useManager()
    const [submissions, setSubmissions] = useState([])
    const [firstNonEmptyIndex, setFirstNonEmptyIndex] = useState(-1)
    const [loading, setLoading] = useState(false)
    const [actionDate, setActionDate] = useState(dayjs().format('DD/MM/YYYY'))
    const [data, setData] = useState([])

    useEffect(() => {

        const actionDateObj = dayjs(actionDate, 'DD/MM/YYYY')
        const filteredSubmissions = submissions.filter((group) => {
            const submitToProprietorDateObj = dayjs(group.submit_to_proprietor_date)
            return submitToProprietorDateObj.isBefore(actionDateObj, 'day') || submitToProprietorDateObj.isSame(actionDateObj, 'day')
        })
        setData(filteredSubmissions)
        const fNEI = filteredSubmissions.findIndex((dt) => dt.items.length > 0)
        setFirstNonEmptyIndex(fNEI)

    }, [actionDate, submissions])

    useEffect(() => {

        let isMounted = true;

        if (!manager) return;

        setLoading(true)
        getSubmissionsData(manager.manager_id).then((submissionsData) => {

            if (submissionsData && isMounted) {
                setSubmissions(submissionsData)
                setLoading(false)
            }
        });

        return () => { isMounted = false }
    }, [manager])

    const reloadSubmissionsData = async () => {
        // setLoading(true)
        const submissionsData = await getSubmissionsData(manager.manager_id)
        setSubmissions(submissionsData)
        // setLoading(false)
    }

    const acceptFormComponent = {
        component: AcceptForm,
        props: {
            reloadSubmissionsData: reloadSubmissionsData,
            manager: manager,
            actionDate: actionDate
        },
        label: "accept"
    }

    return (
        <div>
            <Box style={{ display: "flex", paddingTop: "10px" }}>
                <Typography style={{ padding: "10px" }}>Action Date:</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        format='DD/MM/YYYY'
                        value={dayjs(actionDate, 'DD/MM/YYYY')}
                        onChange={(d) => { console.log(d); setActionDate(d.format('DD/MM/YYYY')) }}
                        maxDate={dayjs()}
                    />
                </LocalizationProvider>
            </Box>
            {
                loading ? <CircularProgress style={{ marginTop: "50px", marginLeft: "200px" }} /> :
                    ((submissions && submissions.length > 0 && firstNonEmptyIndex !== -1) ?
                        <ViewNestedTable data={data} groupingKeys={managerDetailsViewConfig['submissions'].grouping_keys} keys={managerDetailsViewConfig['submissions'].keys} additionalComponents={[acceptFormComponent]} />
                        :
                        <Typography>No Data for Submissions</Typography>
                    )
            }
        </div>
    )
}

export default Accept