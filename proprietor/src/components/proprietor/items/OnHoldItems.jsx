import React, { useEffect, useState } from 'react'
import { Typography, CircularProgress } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'

import GroupedTable from '../../layouts/GroupedTable'
import { getOnHoldItems } from '../../../api'
import { proprietorDetailsViewConfig } from '../../constants/ViewConstants'

const getOnHoldItemsData = async (proprietor_id, issue_date) => {
    try {
        const res = await getOnHoldItems(proprietor_id, issue_date)
        console.log(res.data)
        return res.data

    }
    catch (err) {
        console.log(err)
    }
}

const OnHoldItems = ({ proprietor }) => {

    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))

    useEffect(() => {
        console.log(proprietor)

        setLoading(true)
        getOnHoldItemsData(proprietor.proprietor_id, date).then((onHoldItemsData) => {
            setLoading(false)
            setData(onHoldItemsData)
        });

    }, [proprietor, date])

    return (
        <div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label="As of date"
                    value={dayjs(date, 'YYYY-MM-DD')}
                    onChange={(d) => { setDate(d.format('YYYY-MM-DD')) }}
                    format="DD/MM/YYYY"
                    slotProps={{ textField: { style: { marginBottom: "15px", marginTop: "10px" } } }}
                />
            </LocalizationProvider>
            {loading ? <CircularProgress style={{ margin: "150px" }} /> : (
                (data && data.length > 0) ? <GroupedTable data={data} groupKeys={[]} columns={proprietorDetailsViewConfig['on_hold'].keys} /> : <Typography>No Items on Hold</Typography>
            )}
        </div>
    )
}

export default OnHoldItems
