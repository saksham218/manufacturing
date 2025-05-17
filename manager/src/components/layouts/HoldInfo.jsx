import React, { useEffect, useState } from 'react'
import ViewTable from './ViewTable'
import { Box, Button, Modal, Typography } from '@mui/material'
import { holdInfoViewConfig } from '../constants/ViewConstants'

const getHoldList = (holdInfo) => {
    const holdList = []
    console.log(holdInfo)
    let currentHoldInfo = holdInfo
    while (currentHoldInfo && currentHoldInfo.is_hold) {
        const holdInfoObj = {
            ...currentHoldInfo
        }
        delete holdInfoObj.prev_hold_info
        delete holdInfoObj.is_hold
        console.log(holdInfoObj)
        holdList.push(holdInfoObj)
        currentHoldInfo = currentHoldInfo.prev_hold_info
    }
    return holdList
}

const HoldInfo = ({ holdInfo }) => {

    const [holdList, setHoldList] = useState([])
    const [open, setOpen] = useState(false)

    useEffect(() => {
        console.log(holdInfo)
        const holdListData = getHoldList(holdInfo)
        console.log(holdListData)
        setHoldList(holdListData)
    }, [holdInfo])


    return (
        <div>
            <Button onClick={() => setOpen(true)}>View Hold Info</Button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
            >
                <Box style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    // width: 400,
                    backgroundColor: 'white',
                    border: '2px solid #000',
                    // boxShadow: 24,
                    // p: 4,
                }}>
                    <Typography variant="h6" component="h2">Hold Info:</Typography>
                    {(holdList && holdList.length > 0)
                        ?
                        <ViewTable data={holdList} keys={holdInfoViewConfig.hold_info.keys} />
                        :
                        <div style={{ paddingTop: "20px" }}>
                            No Hold Info
                        </div>
                    }
                </Box>
            </Modal>
        </div >
    )
}

export default HoldInfo