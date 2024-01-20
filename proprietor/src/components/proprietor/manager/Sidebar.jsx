import React from 'react'
import { Link } from 'react-router-dom'
import { Drawer, List, ListItem, ListItemText } from '@mui/material'

const Sidebar = ({ match }) => {
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
                    <ListItem button component={Link} to={`${match.pathnameBase}/viewmanager`}>
                        <ListItemText primary="View Manager" />
                    </ListItem>
                    <ListItem button component={Link} to={`${match.pathnameBase}/issue`}>
                        <ListItemText primary="Issue" />
                    </ListItem>
                    <ListItem button component={Link} to={`${match.pathnameBase}/worker`}>
                        <ListItemText primary="Worker" />
                    </ListItem>
                    <ListItem button component={Link} to={`${match.pathnameBase}/payment`}>
                        <ListItemText primary="Payment" />
                    </ListItem>
                    <ListItem button component={Link} to={`${match.pathnameBase}/addmanager`}>
                        <ListItemText primary="Add Manager" />
                    </ListItem>
                </List>
            </Drawer>
        </div>
    )
}

export default Sidebar