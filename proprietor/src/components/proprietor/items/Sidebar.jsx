import React, { useState, useEffect } from 'react'

import { useNavigate } from 'react-router-dom'
import { Drawer, List, ListItem, ListItemText } from '@mui/material'

import './Sidebar.css'

const Sidebar = ({ match }) => {

    const navigate = useNavigate()
    const [option, setOption] = useState("")

    useEffect(() => {
        setOption(match.pathname.split("/")[3])
    }, [match])


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
                    <ListItem className={option === "createitem" ? "selected" : ""} onClick={() => { navigate(`${match.pathnameBase}/createitem`); setOption("createitem"); }}>
                        <ListItemText primary="Create Item" />
                    </ListItem>
                    <ListItem className={option === "onholditems" ? "selected" : ""} onClick={() => { navigate(`${match.pathnameBase}/onholditems`); setOption("onholditems"); }}>
                        <ListItemText primary="On Hold Items" />
                    </ListItem>

                </List>
            </Drawer>
        </div>
    )
}

export default Sidebar