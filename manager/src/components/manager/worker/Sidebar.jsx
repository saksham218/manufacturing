import React from 'react'
import { Link } from 'react-router-dom'
import { Drawer, List, ListItem, ListItemText } from '@mui/material'

const Sidebar = ({ match, setIsAddWorker }) => {
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
                <List>
                    <ListItem component={Link} to={`${match.pathnameBase}/view`} onClick={() => { setIsAddWorker(false) }}>
                        <ListItemText primary="View Worker" />
                    </ListItem>
                    <ListItem component={Link} to={`${match.pathnameBase}/issue`} onClick={() => { setIsAddWorker(false) }}>
                        <ListItemText primary="Issue" />
                    </ListItem>
                    <ListItem component={Link} to={`${match.pathnameBase}/submit`} onClick={() => { setIsAddWorker(false) }}>
                        <ListItemText primary="Submit" />
                    </ListItem>
                    <ListItem component={Link} to={`${match.pathnameBase}/payment`} onClick={() => { setIsAddWorker(false) }}>
                        <ListItemText primary="Payment" />
                    </ListItem>
                    <ListItem component={Link} to={`${match.pathnameBase}/addworker`} onClick={() => { setIsAddWorker(true) }}>
                        <ListItemText primary="Add Worker" />
                    </ListItem>
                </List>
            </Drawer>
        </div>
    )
}

export default Sidebar