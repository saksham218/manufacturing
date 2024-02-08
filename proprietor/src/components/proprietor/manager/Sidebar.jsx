import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Drawer, List, ListItem, ListItemText } from '@mui/material'

import './Sidebar.css'

const Sidebar = ({ match, isAddManager, setIsAddManager }) => {

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
                <List className='sidebar'>
                    <ListItem className={option === "view" ? "selected" : ""} onClick={() => { setIsAddManager(false); navigate(`${match.pathnameBase}/viewmanager`); setOption("view"); }}>
                        <ListItemText primary="View Manager" />
                    </ListItem>
                    <ListItem className={option === "issue" ? "selected" : ""} onClick={() => { setIsAddManager(false); navigate(`${match.pathnameBase}/issue`); setOption("issue"); }}>
                        <ListItemText primary="Issue" />
                    </ListItem>
                    <ListItem className={option === "worker" ? "selected" : ""} onClick={() => { setIsAddManager(false); navigate(`${match.pathnameBase}/worker`); setOption("worker"); }}>
                        <ListItemText primary="Worker" />
                    </ListItem>
                    <ListItem className={option === "payment" ? "selected" : ""} onClick={() => { setIsAddManager(false); navigate(`${match.pathnameBase}/payment`); setOption("payment"); }}>
                        <ListItemText primary="Payment" />
                    </ListItem>
                    <ListItem className={option === "addmanager" ? "selected" : ""} onClick={() => { setIsAddManager(true); navigate(`${match.pathnameBase}/addmanager`); setOption("addmanager"); }}>
                        <ListItemText primary="Add Manager" />
                    </ListItem>
                </List>
            </Drawer>
        </div>
    )
}

export default Sidebar