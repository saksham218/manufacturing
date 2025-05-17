import React, { useEffect, useState } from 'react'
import { Typography } from '@mui/material'

import { getItemsForFinalSubmit } from '../../../../api'
import ViewNestedTable from '../../../layouts/ViewNestedTable'
import { managerDetailsViewConfig } from '../../../constants/ViewConstants'
import SubmitItemsForm from './components/SubmitItemsForm'


const SubmitItems = ({ manager }) => {

    const [dueBackward, setDueBackward] = useState([])
    const [firstNonEmptyIndex, setFirstNonEmptyIndex] = useState(-1)

    const getItemsData = async () => {
        try {
            const res = await getItemsForFinalSubmit(manager.manager_id)
            const itemsData = res.data;
            console.log(itemsData)
            let fNEI = -1
            if (itemsData) {
                fNEI = itemsData.findIndex((dt) => dt.items.length > 0)
            }
            setFirstNonEmptyIndex(fNEI)
            setDueBackward(itemsData)
        }
        catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getItemsData()
    }, [manager])

    const submitItemsFormComponent = {
        component: SubmitItemsForm,
        props: {
            getItemsData: getItemsData,
            manager: manager
        },
        label: "submit"
    }


    return (
        (dueBackward && dueBackward.length > 0 && firstNonEmptyIndex !== -1) ?
            <ViewNestedTable data={dueBackward} groupingKeys={managerDetailsViewConfig["due_backward"].grouping_keys} keys={managerDetailsViewConfig['due_backward'].keys} additionalComponents={[submitItemsFormComponent]} />
            :
            <Typography>No Data for Due Backward</Typography>
    )
}


export default SubmitItems