import { useState, useEffect } from 'react'
import { Select, MenuItem, Typography, Box } from '@mui/material'

import { getWorkerDetails } from '../../../api'
import GroupedTable from '../../layouts/GroupedTable'
import { useWorker } from './workerContext/WorkerContext'
import { workerDetailsViewConfig } from '../../constants/ViewConstants'
import { useApp } from '../../AppContext'

const getWorkerData = async (worker_id) => {
    try {
        const res = await getWorkerDetails(worker_id)
        console.log(res.data.result)
        return res.data.result
    }
    catch (err) {
        console.log(err)
    }
}

const ViewWorker = () => {

    const { worker } = useWorker()
    const { actionsVersion } = useApp()

    const details = Object.keys(workerDetailsViewConfig)
    const [detail, setDetail] = useState(details[0])

    const [workerDetails, setWorkerDetails] = useState({})
    const [data, setData] = useState([])
    const [viewConfig, setViewConfig] = useState({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let isMounted = true;
        console.log("get worker")
        console.log(worker)
        if (worker && worker.worker_id) {
            setLoading(true)
            getWorkerData(worker.worker_id).then((workerData) => {
                if (isMounted) {
                    setWorkerDetails(workerData)
                    setLoading(false)
                }
            });
        }
        return () => { isMounted = false }
    }, [worker, actionsVersion])

    useEffect(() => {
        let isMounted = true;
        const viewConfigData = workerDetailsViewConfig[detail]
        const displayData = workerDetails[detail]
        if (isMounted) {
            setData(displayData)
            setViewConfig(viewConfigData)
        }
        return () => { isMounted = false }
    }, [detail, workerDetails])

    return (
        <div style={{ paddingTop: "10px" }}>
            <Box style={{ display: 'flex', alignItems: 'center' }}>
                <Select value={detail} onChange={(e) => { setDetail(e.target.value); console.log(detail); }}>
                    {details.map((d) => (
                        <MenuItem value={d}>{d.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</MenuItem>
                    ))}
                </Select>
                <Typography style={{ padding: "10px" }}>Due Amount: {workerDetails.due_amount}</Typography>
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

export default ViewWorker
