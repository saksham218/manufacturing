import React, { useState, useEffect } from 'react'
import { Drawer, Box, Typography, CircularProgress } from '@mui/material'
import HistoryIcon from '@mui/icons-material/History'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { getActions } from '../../api'
import ActionCard from './ActionCard'
import ActionDetailModal from './ActionDetailModal'
import { useApp } from '../AppContext'
import './ActionsDrawer.css'

const ActionsDrawer = ({ onActionUndone }) => {
    const { actionsVersion, onMutation } = useApp()
    const [open, setOpen] = useState(false)
    const [actions, setActions] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedActionId, setSelectedActionId] = useState(null)

    useEffect(() => {
        if (!open) return
        setLoading(true)
        getActions({})
            .then(res => setActions(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [open, actionsVersion])

    if (!open) {
        return (
            <div
                className="actions-collapsed"
                onClick={() => setOpen(true)}
                role="button"
                tabIndex={0}
            >
                <HistoryIcon fontSize="small" />
            </div>
        )
    }

    return (
        <>
            <Drawer
                variant="permanent"
                anchor="right"
                sx={{
                    flexShrink: 0,
                    width: 240,
                    borderLeft: '1px solid #ccc',
                    borderBottom: '2px solid #ccc',
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        position: 'relative',
                    },
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div
                        className="actions-header"
                        onClick={() => setOpen(false)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(false) }}
                    >
                        <Typography variant="h6">History</Typography>
                        <ChevronRightIcon />
                    </div>
                    <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                        {loading
                            ? <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}><CircularProgress /></Box>
                            : actions.length === 0
                                ? <Typography color="text.secondary">No actions found.</Typography>
                                : actions.map(action => (
                                    <ActionCard
                                        key={action.action_id}
                                        action={action}
                                        onViewDetails={(id) => setSelectedActionId(id)}
                                    />
                                ))
                        }
                    </Box>
                </Box>
            </Drawer>
            <ActionDetailModal
                open={!!selectedActionId}
                action_id={selectedActionId}
                onClose={() => setSelectedActionId(null)}
                onUndone={(action_id) => {
                    setActions(prev => prev.map(a =>
                        a.action_id === action_id ? { ...a, undone: true, undo_date: new Date() } : a
                    ))
                    onMutation()
                    if (onActionUndone) onActionUndone()
                }}
            />
        </>
    )
}

export default ActionsDrawer
