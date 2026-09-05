import React, { useState, useEffect } from 'react'
import { Select, MenuItem, Typography, Box, CircularProgress } from '@mui/material'

import { getManager } from '../../api'
import GroupedTable from '../layouts/GroupedTable'
import { managerDetailsViewConfig } from '../constants/ViewConstants'

const getManagerData = async (manager_id) => {
    try {
        const res = await getManager(manager_id)
        console.log(res.data)
        return res.data
    }
    catch (err) {
        console.log(err)
    }
}

const View = ({ manager }) => {
    const details = Object.keys(managerDetailsViewConfig)
    const [detail, setDetail] = useState(details[0])

    const [managerDetails, setManagerDetails] = useState({})
    const [data, setData] = useState([])
    const [viewConfig, setViewConfig] = useState({})
    const [loading, setLoading] = useState(false)

    const setDisplayData = (d, mD) => {
        const viewConfigData = managerDetailsViewConfig[d]
        const displayData = mD[d]
        console.log(displayData)
        setData(displayData)
        setViewConfig(viewConfigData)
    }

    useEffect(() => {
        console.log("get manager")
        console.log(manager)
        setLoading(true)
        getManagerData(manager.manager_id).then((managerData) => {
            setLoading(false)
            setManagerDetails(managerData)
        });
    }, [manager])

    useEffect(() => {
        setDisplayData(detail, managerDetails);
    }, [detail, managerDetails])

    return (
        loading ? <CircularProgress style={{ marginTop: "50px", marginLeft: "50px" }} /> :
            (<div style={{ padding: "10px" }}>
                <Box style={{ display: 'flex' }}>
                    <Select value={detail} onChange={(e) => { setDetail(e.target.value); console.log(detail); }}>
                        {details.map((d) => (
                            <MenuItem value={d}>{d.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</MenuItem>
                        ))}
                    </Select>
                    <Typography style={{ padding: "10px" }}>Due Amount: {managerDetails.due_amount}</Typography>
                </Box>
                <Box style={{ padding: "10px" }}>
                    {(data && data.length > 0)
                        ? <GroupedTable key={detail} data={data} groupKeys={viewConfig.grouping_keys || []} columns={viewConfig.keys} />
                        : <Typography>No Data for {detail.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Typography>}
                </Box>
            </div>)
    )
}

export default View
