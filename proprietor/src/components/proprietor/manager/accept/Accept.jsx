import React, { useState } from 'react'
import { Typography, CircularProgress } from '@mui/material'

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


    const setSubmissionsData = (submissionsData) => {
        setSubmissions(submissionsData)
        const fNEI = submissionsData.findIndex((dt) => dt.items.length > 0)
        setFirstNonEmptyIndex(fNEI)
    }

    useEffect(() => {

        let isMounted = true;

        if (!manager) return;

        setLoading(true)
        getSubmissionsData(manager.manager_id).then((submissionsData) => {

            if (submissionsData && isMounted) {
                setSubmissionsData(submissionsData)
                setLoading(false)
            }
        });

        return () => { isMounted = false }
    }, [manager])

    const reloadSubmissionsData = async () => {
        // setLoading(true)
        const submissionsData = await getSubmissionsData(manager.manager_id)
        setSubmissionsData(submissionsData)
        // setLoading(false)
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
        loading ? <CircularProgress style={{ marginTop: "50px", marginLeft: "200px" }} /> :
            ((submissions && submissions.length > 0 && firstNonEmptyIndex !== -1) ?
                <ViewNestedTable data={submissions} groupingKeys={managerDetailsViewConfig['submissions'].grouping_keys} keys={managerDetailsViewConfig['submissions'].keys} additionalComponents={[acceptFormComponent]} />
                :
                <Typography>No Data for Submissions</Typography>
            )
    )
}

export default Accept