import React from 'react'
import { Link } from 'react-router-dom'
import { Drawer, List, ListItem, ListItemText } from '@mui/material'

const Sidebar = ({ match, isAddManager, setIsAddManager }) => {
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
                    <ListItem component={Link} to={`${match.pathnameBase}/viewmanager`} onClick={() => { setIsAddManager(false) }}>
                        <ListItemText primary="View Manager" />
                    </ListItem>
                    <ListItem component={Link} to={`${match.pathnameBase}/issue`} onClick={() => { setIsAddManager(false) }}>
                        <ListItemText primary="Issue" />
                    </ListItem>
                    <ListItem component={Link} to={`${match.pathnameBase}/worker`} onClick={() => { setIsAddManager(false) }}>
                        <ListItemText primary="Worker" />
                    </ListItem>
                    <ListItem component={Link} to={`${match.pathnameBase}/payment`} onClick={() => { setIsAddManager(false) }}>
                        <ListItemText primary="Payment" />
                    </ListItem>
                    <ListItem component={Link} to={`${match.pathnameBase}/addmanager`} onClick={() => { setIsAddManager(true) }}>
                        <ListItemText primary="Add Manager" />
                    </ListItem>
                </List>
            </Drawer>
        </div>
    )
}

export default Sidebar