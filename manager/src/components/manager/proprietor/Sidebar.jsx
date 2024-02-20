import React, { useState } from 'react'

import { useNavigate, Link } from 'react-router-dom'
import { Drawer, List, ListItem, ListItemText, Button } from '@mui/material'

import './Sidebar.css'

const Sidebar = ({ match }) => {

    const navigate = useNavigate()
    const [option, setOption] = useState("submititems")

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
                    <ListItem className={option === "submititems" ? "selected" : ""} onClick={() => { navigate(`${match.pathnameBase}/submititems`); setOption("submititems"); }}>
                        <ListItemText primary="Submit Items" />
                    </ListItem>
                    <ListItem className={option === "expenserequest" ? "selected" : ""} onClick={() => { navigate(`${match.pathnameBase}/expenserequest`); setOption("expenserequest"); }}>
                        <ListItemText primary="Expense Request" />
                    </ListItem>

                </List>
            </Drawer>
        </div>
    )
}

export default Sidebar