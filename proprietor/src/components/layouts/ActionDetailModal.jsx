import React, { useState, useRef, useEffect } from 'react'
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Typography, Box, IconButton, Divider, CircularProgress, Button
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import dayjs from 'dayjs'
import { getActionDetail, undoAction } from '../../api'
import { computeContent, computeBackgroundColor } from '../utils/viewUtils'
import CustomButton from './CustomButton'

const OMIT_FROM_TABLE = new Set(['is_adhoc', 'to_hold', 'hold_info', '_id', 'is_price_from_df'])

const snake_to_label = (key) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const renderField = (fields, key) => {
    const val = fields[key]
    if (typeof val === 'boolean') return val ? 'Yes' : 'No'
    if (key === 'price_on_issue_date') return String(val ?? '-')
    return computeContent(fields, key)
}

const ActionDetailModal = ({ open, onClose, action_id, onUndone }) => {
    const [detail, setDetail] = useState(null)
    const [loading, setLoading] = useState(false)
    const cache = useRef(new Map())

    useEffect(() => {
        if (!open || !action_id) return
        if (cache.current.has(action_id)) {
            setDetail(cache.current.get(action_id))
            return
        }
        setLoading(true)
        getActionDetail(action_id)
            .then(res => {
                cache.current.set(action_id, res.data)
                setDetail(res.data)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [open, action_id])

    const handleUndo = async () => {
        await undoAction(action_id)
        cache.current.delete(action_id)
        setDetail(d => d ? { ...d, undone: true, undo_date: new Date() } : d)
        if (onUndone) onUndone(action_id)
    }

    const fields = detail?.fields
    const displayKeys = fields
        ? [...Object.keys(fields).filter(k => !OMIT_FROM_TABLE.has(k)), 'info']
        : []
    const borderColor = fields ? computeBackgroundColor(fields) : 'white'

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{detail?.description ?? ''}</Typography>
                    <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers sx={borderColor !== 'white' ? { borderLeft: `4px solid ${borderColor}` } : undefined}>
                {loading
                    ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                    : detail && (
                        <>
                            <Typography variant="body2" color="text.secondary">
                                {detail.event_date_label}: {dayjs(detail.event_date).format('DD/MM/YYYY')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                Record Date: {dayjs(detail.record_date).format('DD/MM/YYYY')}
                            </Typography>

                            <Divider sx={{ mb: 1.5 }} />

                            {displayKeys.map(key => (
                                <Box key={key} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 0.75 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 160, pt: 0.25 }}>
                                        {snake_to_label(key)}
                                    </Typography>
                                    <Typography variant="body2" component="div">
                                        {renderField(fields, key)}
                                    </Typography>
                                </Box>
                            ))}

                            {detail.undone && (
                                <>
                                    <Divider sx={{ mt: 1.5, mb: 1 }} />
                                    <Typography variant="body2" color="error">
                                        Undone on: {dayjs(detail.undo_date).format('DD/MM/YYYY HH:mm')}
                                    </Typography>
                                </>
                            )}
                        </>
                    )
                }
            </DialogContent>
            <DialogActions>
                <CustomButton
                    buttonProps={{
                        variant: 'outlined', color: 'error', size: 'small',
                        sx: { '&:hover': { backgroundColor: 'error.main', color: 'white' } },
                    }}
                    isInputValid={!detail?.undone}
                    onClick={handleUndo}
                    successMessage="Action undone successfully"
                    errorMessage="Could not undo action"
                >
                    Undo
                </CustomButton>
                <Button variant="contained" onClick={onClose} size="small">Close</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ActionDetailModal
