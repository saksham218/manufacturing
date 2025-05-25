import React, { useEffect, useState } from 'react'
import { Typography } from '@mui/material'

import ViewTable from '../../layouts/ViewTable'
import { getOnHoldItems } from '../../../api'
import { proprietorDetailsViewConfig } from '../../constants/ViewConstants'

const getOnHoldItemsData = async (proprietor_id) => {
    try {
        const res = await getOnHoldItems(proprietor_id)
        console.log(res.data)
        return res.data

    }
    catch (err) {
        console.log(err)
    }
}

const OnHoldItems = ({ proprietor }) => {

    const [data, setData] = useState([])

    useEffect(() => {
        console.log(proprietor)

        getOnHoldItemsData(proprietor.proprietor_id).then((onHoldItemsData) => {
            setData(onHoldItemsData)
        });

    }, [proprietor])

    return (
        <div>
            {(data && data.length > 0) ? <ViewTable data={data} keys={proprietorDetailsViewConfig['on_hold'].keys} /> : <Typography>No Items on Hold</Typography>}
        </div>
    )
}

export default OnHoldItems