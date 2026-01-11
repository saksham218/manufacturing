import React, { useState, useEffect } from 'react'

import { useNavigate } from 'react-router-dom'
import { Drawer, List, ListItem, ListItemText } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import './Sidebar.css'

const drawerHeight = 500

const Sidebar = ({ match }) => {

    const navigate = useNavigate()
    const [option, setOption] = useState("")
    const [drawerOpen, setDrawerOpen] = useState(true)

    useEffect(() => {
        setOption(match.pathname.split("/")[3])
    }, [match])


    console.log(match)
    return (
        <>
            {drawerOpen ? (
                <Drawer
                    variant="permanent"
                    sx={{
                        flexShrink: 0,
                        height: drawerHeight,
                        width: 240,
                        borderRight: '1px solid #ccc',
                        borderBottom: '2px solid #ccc',
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            position: 'relative',
                        },
                    }}
                >
                    <div className="sidebar-drawer">
                        <div
                            className="sidebar-header"
                            role="button"
                            tabIndex={0}
                            onClick={() => setDrawerOpen(false)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDrawerOpen(false) }}
                        >
                            <ChevronLeftIcon />
                        </div>
                        <List className="sidebar">
                            <ListItem className={option === "submititems" ? "selected" : ""} onClick={() => { navigate(`${match.pathnameBase}/submititems`); setOption("submititems"); }}>
                                <ListItemText primary="Submit Items" />
                            </ListItem>
                            <ListItem className={option === "expenserequest" ? "selected" : ""} onClick={() => { navigate(`${match.pathnameBase}/expenserequest`); setOption("expenserequest"); }}>
                                <ListItemText primary="Expense Request" />
                            </ListItem>
                        </List>
                    </div>
                </Drawer>
            ) : (
                <div
                    className="sidebar-collapsed"
                    style={{ height: drawerHeight }}
                    onClick={() => setDrawerOpen(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDrawerOpen(true) }}
                >
                    <ChevronRightIcon />
                </div>
            )}
        </>
    )
}

export default Sidebar