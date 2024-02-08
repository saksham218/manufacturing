import React, { useEffect, useState } from 'react'

import { getManager } from '../../../api'
import { Select, MenuItem, Typography } from '@mui/material'
import ViewTable from '../../layouts/ViewTable'

const ViewManager = ({ manager, getManagersData }) => {

    const [managerDetails, setManagerDetails] = useState({})

    const getManagerData = async () => {
        try {
            const res = await getManager(manager.manager_id)
            console.log(res.data)
            setManagerDetails(res.data)

        }
        catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getManagersData();
    }, [])

    useEffect(() => {
        console.log("get manager")
        console.log(manager)
        getManagerData();
    }, [manager])

    const details = ['total_due', 'due_forward', 'due_backward', 'issue_history', 'submit_history']

    const [detail, setDetail] = useState(details[0])

    return (
        <div style={{ paddingTop: "10px" }}>
            <Select value={detail} onChange={(e) => { setDetail(e.target.value); console.log(detail); console.log(managerDetails[detail]) }}>
                {details.map((d) => (
                    <MenuItem value={d}>{d.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</MenuItem>
                ))}
            </Select>
            {(managerDetails[detail] && managerDetails[detail].length > 0) ? <ViewTable data={managerDetails[detail]} />
                : <Typography>No Data for {detail.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Typography>}

        </div>
    )
}

export default ViewManager