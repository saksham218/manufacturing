import React, { useState, useEffect } from 'react'
import { Select, MenuItem, Typography, Box } from '@mui/material'

import { getManager } from '../../api'
import ViewTable from '../layouts/ViewTable'

const View = ({ manager }) => {
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
        console.log("get manager")
        console.log(manager)
        getManagerData();
    }, [manager])

    const details = ['total_due', 'due_forward', 'due_backward', 'issue_history', 'submit_history', 'expense_requests']

    const [detail, setDetail] = useState(details[0])

    return (
        <div style={{ padding: "10px" }}>
            <Box style={{ display: 'flex' }}>
                <Select value={detail} onChange={(e) => { setDetail(e.target.value); console.log(detail); console.log(managerDetails[detail]) }}>
                    {details.map((d) => (
                        <MenuItem value={d}>{d.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</MenuItem>
                    ))}
                </Select>
                <Typography style={{ padding: "10px" }}>Due Amount: {managerDetails.due_amount}</Typography>
            </Box>
            {(managerDetails[detail] && managerDetails[detail].length > 0) ? <ViewTable data={managerDetails[detail]} />
                : <Typography>No Data for {detail.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Typography>}

        </div>
    )
}

export default View