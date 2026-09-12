import { useState, useEffect } from 'react'
import { Typography, Box } from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs'
import { getSubmissions } from '../../../../api'
import { useManager } from '../managerContext/ManagerContext'
import AcceptForm from './components/AcceptForm'
import GroupedTable from '../../../layouts/GroupedTable'
import { useApp } from '../../../AppContext'

const getSubmissionsData = async (manager_id, accept_date) => {
    try {
        const res = await getSubmissions(manager_id, accept_date);
        console.log(res.data)

        return res.data;
    }
    catch (err) {
        console.log(err)
    }
}

const Accept = () => {

    const { manager } = useManager()
    const { actionsVersion } = useApp()
    const [loading, setLoading] = useState(false)
    const [actionDate, setActionDate] = useState(dayjs().format('DD/MM/YYYY'))
    const [data, setData] = useState([])

    useEffect(() => {

        let isMounted = true;

        if (!manager) return;

        setLoading(true)
        getSubmissionsData(manager.manager_id, dayjs(actionDate, 'DD/MM/YYYY').format('YYYY-MM-DD')).then((submissionsData) => {

            if (submissionsData && isMounted) {
                setData(submissionsData)
                setLoading(false)
            }
        });

        return () => { isMounted = false }
    }, [manager, actionDate, actionsVersion])

    const acceptFormComponent = {
        component: AcceptForm,
        props: {
            manager: manager,
            actionDate: actionDate
        },
        label: "action"
    }

    return (
        <div>
            <Box style={{ display: "flex", paddingTop: "10px" }}>
                <Typography style={{ padding: "10px" }}>Action Date:</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        format='DD/MM/YYYY'
                        value={dayjs(actionDate, 'DD/MM/YYYY')}
                        onChange={(d) => { console.log(d); setActionDate(d.format('DD/MM/YYYY')) }}
                        maxDate={dayjs()}
                    />
                </LocalizationProvider>
            </Box>
            <GroupedTable
                loading={loading}
                data={data}
                groupKeys={[]}
                columns={["worker", "submit_to_proprietor_date", "item", "quantity", "price", "deduction_from_manager", "remarks_from_manager", "underprocessing_value", "remarks_from_proprietor", "info"]}
                additionalComponents={[acceptFormComponent]}
                noDataMessage="No Data for Submissions"
            />
        </div>
    )
}

export default Accept