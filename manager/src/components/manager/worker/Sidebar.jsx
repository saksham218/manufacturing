import React, { useState } from 'react'

import { useNavigate, Link } from 'react-router-dom'
import { Drawer, List, ListItem, ListItemText, Button } from '@mui/material'

import './Sidebar.css'

const Sidebar = ({ match, setIsAddWorker }) => {

    const navigate = useNavigate()
    const [option, setOption] = useState("view")

    console.log(match)
    return (
        <div >
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 240,
                        boxSizing: 'border-box',
                        position: 'relative',
                    },
                }}
            >
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
                    <ListItem className={option === "payment" ? "selected" : ""} onClick={() => { setIsAddWorker(false); navigate(`${match.pathnameBase}/payment`); setOption("payment"); }}>
                        <ListItemText primary="Payment" />
                    </ListItem>
                    <ListItem className={option === "add" ? "selected" : ""} onClick={() => { setIsAddWorker(true); navigate(`${match.pathnameBase}/addworker`); setOption("add"); }}>
                        <ListItemText primary="Add Worker" />
                    </ListItem>
                </List>
            </Drawer>
        </div>
    )
}

export default Sidebar