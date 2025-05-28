import React, { useEffect, useState } from 'react'
import { Typography, CircularProgress } from '@mui/material'

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

    const [loading, setLoading] = useState(false)


    const setItemsData = (itemsData) => {
        setDueBackward(itemsData)
        const fNEI = itemsData.findIndex((dt) => dt.items.length > 0)
        setFirstNonEmptyIndex(fNEI)
    }

    useEffect(() => {
        setLoading(true)
        getItemsData(manager.manager_id).then((itemsData) => {
            setItemsData(itemsData)
            setLoading(false)
        })
    }, [manager])

    const reloadDueBackward = async () => {
        const itemsData = await getItemsData(manager.manager_id)
        setItemsData(itemsData)
    }

    const submitItemsFormComponent = {
        component: SubmitItemsForm,
        props: {
            reloadDueBackward: reloadDueBackward,
            manager: manager
        },
        label: "submit"
    }


    return (
        loading ? <CircularProgress /> :
            (dueBackward && dueBackward.length > 0 && firstNonEmptyIndex !== -1) ?
                <ViewNestedTable data={dueBackward} groupingKeys={managerDetailsViewConfig["due_backward"].grouping_keys} keys={managerDetailsViewConfig['due_backward'].keys} additionalComponents={[submitItemsFormComponent]} />
                :
                <Typography>No Data for Due Backward</Typography>
    )
}


export default SubmitItems