import { useState } from 'react'
import { IconButton, Popover, Box } from '@mui/material'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'


const DateRangeFilterPopover = ({ value, onChange }) => {
    const [anchor, setAnchor] = useState(null)
    const isActive = value.start !== '' || value.end !== ''

    return (
        <>
            <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}
                sx={{ color: isActive ? 'white' : 'rgba(255,255,255,0.5)' }}>
                <FilterAltIcon fontSize="small" />
            </IconButton>
            <Popover
                open={!!anchor}
                anchorEl={anchor}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="From"
                            format="DD/MM/YYYY"
                            value={value.start ? dayjs(value.start, 'DD/MM/YYYY') : null}
                            onChange={(d) => onChange({ ...value, start: d ? d.format('DD/MM/YYYY') : '' })}
                        />
                        <DatePicker
                            label="To"
                            format="DD/MM/YYYY"
                            value={value.end ? dayjs(value.end, 'DD/MM/YYYY') : null}
                            onChange={(d) => onChange({ ...value, end: d ? d.format('DD/MM/YYYY') : '' })}
                        />
                    </LocalizationProvider>
                </Box>
            </Popover>
        </>
    )
}

export default DateRangeFilterPopover
