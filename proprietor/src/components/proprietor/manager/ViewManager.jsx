import { useEffect, useState } from 'react'
import { Select, MenuItem, Typography, Box } from '@mui/material'

import { getManager } from '../../../api'
import GroupedTable from '../../layouts/GroupedTable'
import { useManager } from './managerContext/ManagerContext'
import { managerDetailsViewConfig } from '../../constants/ViewConstants'
import { useApp } from '../../AppContext'

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

const ViewManager = () => {

    const { manager } = useManager()
    const { actionsVersion } = useApp()

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
        let isMounted = true;
        console.log("get manager")
        console.log(manager)
        if (manager && manager.manager_id) {
            setLoading(true)
            getManagerData(manager.manager_id).then((managerData) => {
                if (managerData && isMounted) {
                    setLoading(false)
                    setManagerDetails(managerData)
                }
            })
        }
        return () => { isMounted = false }
    }, [manager, actionsVersion])

    useEffect(() => {
        setDisplayData(detail, managerDetails);
    }, [detail, managerDetails])

    return (
        <div style={{ paddingTop: "10px" }}>
            <Box style={{ display: 'flex', alignItems: 'center' }}>
                <Select value={detail} onChange={(e) => { setDetail(e.target.value); console.log(detail); }}>
                    {details.map((d) => (
                        <MenuItem value={d}>{d.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</MenuItem>
                    ))}
                </Select>
                <Typography style={{ padding: "10px" }}>Due Amount: {managerDetails?.due_amount}</Typography>
            </Box>
            <Box style={{ padding: "10px" }}>
                <GroupedTable
                    loading={loading}
                    key={detail}
                    data={data}
                    groupKeys={viewConfig.grouping_keys || []}
                    columns={viewConfig.keys}
                    noDataMessage={`No Data for ${detail.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`}
                />
            </Box>
        </div>
    )
}

export default ViewManager
