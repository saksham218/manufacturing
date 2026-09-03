import React from 'react'
import { Box, Typography, Button, Chip } from '@mui/material'
import dayjs from 'dayjs'

const ActionCard = ({ action, onViewDetails }) => {
    const { action_id, action_details, event_date, record_date, undone, undo_date } = action
    const { description, event_date_label } = action_details

    return (
        <Box
            sx={{
                px: 2, py: 1,
                borderBottom: '1px solid #e0e0e0',
                opacity: undone ? 0.7 : 1,
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                <Typography variant="subtitle2" fontWeight="medium" sx={{ flexGrow: 1 }}>
                    {description}
                </Typography>
                {undone && <Chip label="Undone" color="error" size="small" sx={{ ml: 1, flexShrink: 0 }} />}
            </Box>
            <Typography variant="body2" color="text.secondary">
                {event_date_label}: {dayjs(event_date).format('DD/MM/YYYY')}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
                Record Date: {dayjs(record_date).format('DD/MM/YYYY')}
            </Typography>
            {undone && (
                <Typography variant="caption" color="error" display="block">
                    Undone on: {dayjs(undo_date).format('DD/MM/YYYY HH:mm')}
                </Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                <Button size="small" onClick={() => onViewDetails(action_id)}>View Details</Button>
            </Box>
        </Box>
    )
}

export default ActionCard
