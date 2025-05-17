import React, { useState } from 'react'
import { Table, TableHead, TableRow, TableCell, Paper, Button, FormControl, Input, TableBody, Typography } from '@mui/material'

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


    const setSubmissionsData = (submissionsData) => {
        setSubmissions(submissionsData)
        const fNEI = submissionsData.findIndex((dt) => dt.items.length > 0)
        setFirstNonEmptyIndex(fNEI)
    }

    useEffect(() => {

        let isMounted = true;

        if (!manager) return;

        getSubmissionsData(manager.manager_id).then((submissionsData) => {

            if (submissionsData && isMounted) {
                setSubmissionsData(submissionsData)
            }
        });

        return () => { isMounted = false }
    }, [manager])

    const reloadSubmissionsData = () => {
        getSubmissionsData(manager.manager_id).then((submissionsData) => {
            setSubmissionsData(submissionsData)
        });
    }

    const acceptFormComponent = {
        component: AcceptForm,
        props: {
            reloadSubmissionsData: reloadSubmissionsData,
            manager: manager
        },
        label: "accept"
    }

    return (
        (submissions && submissions.length > 0 && firstNonEmptyIndex !== -1) ?
            <ViewNestedTable data={submissions} groupingKeys={managerDetailsViewConfig['submissions'].grouping_keys} keys={managerDetailsViewConfig['submissions'].keys} additionalComponents={[acceptFormComponent]} />
            :
            <Typography>No Data for Submissions</Typography>
    )
}

export default Accept