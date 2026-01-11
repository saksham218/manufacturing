import React, { useState, useEffect } from 'react'

import { useNavigate } from 'react-router-dom'
import { Drawer, List, ListItem, ListItemText } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import './Sidebar.css'

const drawerHeight = 500
const Sidebar = ({ match, setIsAddWorker }) => {

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
                            <ListItem className={option === "view" ? "selected" : ""} onClick={() => { setIsAddWorker(false); navigate(`${match.pathnameBase}/view`); setOption("view"); }}>
                                <ListItemText primary="View Worker" />
                            </ListItem>
                            <ListItem className={option === "issue" ? "selected" : ""} onClick={() => { setIsAddWorker(false); navigate(`${match.pathnameBase}/issue`); setOption("issue"); }}>
                                <ListItemText primary="Issue" />
                            </ListItem>
                            <ListItem className={option === "submit" ? "selected" : ""} onClick={() => { setIsAddWorker(false); navigate(`${match.pathnameBase}/submit`); setOption("submit"); }}>
                                <ListItemText primary="Submit" />
                            </ListItem>
                            {/* <ListItem className={option === "submitadhoc" ? "selected" : ""} onClick={() => { setIsAddWorker(false); navigate(`${match.pathnameBase}/submitadhoc`); setOption("submitadhoc"); }}>
                                <ListItemText primary="Submit Adhoc" />
                            </ListItem> */}
                            <ListItem className={option === "payment" ? "selected" : ""} onClick={() => { setIsAddWorker(false); navigate(`${match.pathnameBase}/payment`); setOption("payment"); }}>
                                <ListItemText primary="Payment" />
                            </ListItem>
                            <ListItem className={option === "addworker" ? "selected" : ""} onClick={() => { setIsAddWorker(true); navigate(`${match.pathnameBase}/addworker`); setOption("addworker"); }}>
                                <ListItemText primary="Add Worker" />
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