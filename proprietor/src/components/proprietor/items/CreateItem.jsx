import React, { useEffect, useState } from 'react'
import { Input, InputLabel, FormControl, FormGroup, Button, Table, TableHead, TableRow, TableCell, TableContainer, Paper } from '@mui/material'

import { createItem, getItems } from '../../../api/index.js'

const CreateItem = ({ proprietor }) => {

    const [newItem, setNewItem] = useState({ design_number: "", description: "", price: "", underprocessing_value: "" })
    const [items, setItems] = useState([])

    const onSubmit = async (e) => {
        e.preventDefault()
        console.log(newItem)

        try {
            const submitItem = { ...newItem, proprietor_id: proprietor.proprietor_id }
            console.log(submitItem)
            const res = await createItem(submitItem, proprietor.proprietor_id)
            console.log(res)
            // setItems(...items, res.data.result)
            getItemsData();
            setNewItem({ design_number: "", description: "", price: "", underprocessing_value: "" })
        }
        catch (err) {
            console.log(err)
        }
    }

    const getItemsData = async () => {
        const res = await getItems(proprietor.proprietor_id)
        console.log(res.data)
        setItems(res.data)
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
                <Button variant="contained" color="primary" style={{ width: "100px", marginLeft: "100px" }}
                    disabled={newItem.design_number === "" ||
                        newItem.description === "" ||
                        newItem.price === "" ||
                        newItem.underprocessing_value === ""}

                    onClick={onSubmit}>Add</Button>
            </FormGroup>
            <TableContainer component={Paper}>
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
            </TableContainer>
        </div>
    )
}

export default CreateItem