import React, { useEffect, useState } from 'react'
import { Input, InputLabel, FormControl, FormGroup, Table, TableHead, TableRow, TableCell, TableContainer, Paper, Typography, CircularProgress, Box } from '@mui/material'

import { createItem, getItems } from '../../../api/index.js'
import CustomButton from '../../layouts/CustomButton'
import ViewTable from '../../layouts/ViewTable.jsx'
import { managerDetailsViewConfig } from '../../constants/ViewConstants.js'

const CreateItem = ({ proprietor }) => {

    const [newItem, setNewItem] = useState({ design_number: "", description: "", price: "", underprocessing_value: "" })
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)

    const onSubmit = async () => {

        const submitItem = { ...newItem, proprietor_id: proprietor.proprietor_id }
        console.log(submitItem)
        const res = await createItem(submitItem, proprietor.proprietor_id)
        console.log(res)
        // setItems(...items, res.data.result)
        getItemsData();
        setNewItem({ design_number: "", description: "", price: "", underprocessing_value: "" })
    }

    const getItemsData = async () => {
        setLoading(true)
        const res = await getItems(proprietor.proprietor_id)
        console.log(res.data)
        setItems(res.data)
        setLoading(false)
    }

    useEffect(() => {
        console.log("get Items")
        console.log(proprietor)


        getItemsData();


    }, [proprietor])


    return (
        <div>
            <FormGroup style={{ width: "500px", padding: "20px" }}>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Design Number</InputLabel>
                    <Input value={newItem.design_number} onChange={(e) => { setNewItem({ ...newItem, design_number: e.target.value }); console.log(newItem); }} />
                </FormControl>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Description</InputLabel>
                    <Input value={newItem.description} onChange={(e) => { setNewItem({ ...newItem, description: e.target.value }); console.log(newItem); }} />
                </FormControl>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Price</InputLabel>
                    <Input type="number" inputProps={{ min: 0 }} value={newItem.price} onChange={(e) => { setNewItem({ ...newItem, price: e.target.value }); console.log(newItem); }} />
                </FormControl>
                <FormControl style={{ padding: "15px" }}>
                    <InputLabel>Under Processing Value</InputLabel>
                    <Input type="number" inputProps={{ min: 0 }} value={newItem.underprocessing_value} onChange={(e) => { setNewItem({ ...newItem, underprocessing_value: e.target.value }); console.log(newItem); }} />
                </FormControl>
                <CustomButton buttonProps={{ variant: "contained", color: "primary", style: { width: "100px", marginLeft: "100px" } }}
                    isInputValid={newItem.design_number !== "" &&
                        newItem.description !== "" &&
                        newItem.price !== "" &&
                        newItem.underprocessing_value !== ""}

                    onClick={onSubmit}
                    successMessage="Item added successfully"
                    errorMessage="Failed to add item"
                >Add</CustomButton>
            </FormGroup>
            {/* <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Design Number</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Under Processing Value</TableCell>
                            <TableCell>Created On</TableCell>
                        </TableRow>
                    </TableHead>
                    {items.map((item) => {
                        const date = new Date(item.createdOn)
                        return (
                            <TableRow key={item._id}>
                                <TableCell>{item.design_number}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>{item.price}</TableCell>
                                <TableCell>{item.underprocessing_value}</TableCell>
                                <TableCell>{date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}</TableCell>
                            </TableRow>
                        )
                    })}
                </Table>
            </TableContainer> */}
            <Box style={{ width: "1000px" }}>
                {loading ? <CircularProgress style={{ margin: "150px" }} /> :
                    ((items && items.length > 0) ? <ViewTable data={items} keys={managerDetailsViewConfig['items'].keys} /> : <Typography>No Data for Items</Typography>)}
            </Box>
        </div>
    )
}

export default CreateItem