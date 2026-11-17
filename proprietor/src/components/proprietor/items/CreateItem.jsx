import React, { useEffect, useState } from 'react'
import { Input, InputLabel, FormControl, FormGroup, Table, TableHead, TableRow, TableCell, TableContainer, Paper, Box, TextField, IconButton, CircularProgress, Snackbar, Alert, Stack } from '@mui/material'
import { alpha } from '@mui/material/styles'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

import { createItem, getItems, updateItem } from '../../../api/index.js'
import CustomButton from '../../layouts/CustomButton'
import GroupedTable from '../../layouts/GroupedTable.jsx'
import { proprietorDetailsViewConfig } from '../../constants/ViewConstants.js'
import { computeContent } from '../../utils/viewUtils'

// Rendered by GroupedTable as additional components, so they are kept outside CreateItem
// to avoid remounting (and losing input focus) on every render.
const stopRowClick = (e) => e.stopPropagation()

const DescriptionCell = ({ item, items, editingIndex, draft, setDraft }) => {
    if (items.indexOf(item) !== editingIndex) return item.description
    return <TextField size="small" value={draft.description} onClick={stopRowClick} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
}

const GeneralPriceCell = ({ item, items, editingIndex, draft, setDraft }) => {
    if (items.indexOf(item) !== editingIndex) return item.price
    return <TextField size="small" type="number" inputProps={{ min: 0 }} value={draft.price} onClick={stopRowClick} onChange={(e) => setDraft({ ...draft, price: e.target.value })} sx={{ width: 120 }} />
}

const UnderprocessingValueCell = ({ item, items, editingIndex, draft, setDraft }) => {
    if (items.indexOf(item) !== editingIndex) return item.underprocessing_value
    return <TextField size="small" type="number" inputProps={{ min: 0 }} value={draft.underprocessing_value} onClick={stopRowClick} onChange={(e) => setDraft({ ...draft, underprocessing_value: e.target.value })} sx={{ width: 120 }} />
}

const DateCell = ({ item, dateKey }) => computeContent(item, dateKey)

const EditCell = ({ item, items, editingIndex, draft, submitting, onEdit, onCancel, onSubmit }) => {
    const index = items.indexOf(item)
    if (index !== editingIndex) {
        return <IconButton size="small" disabled={submitting} onClick={(e) => { stopRowClick(e); onEdit(index) }} sx={(theme) => ({ '&:hover': { backgroundColor: alpha(theme.palette.grey[500], 0.3) } })}><EditIcon fontSize="small" /></IconButton>
    }
    const isValid = draft.description.trim() !== "" &&
        Number(draft.price) > 0 &&
        Number(draft.underprocessing_value) > 0 &&
        (draft.description.trim() !== item.description || Number(draft.price) !== item.price || Number(draft.underprocessing_value) !== item.underprocessing_value)
    return (
        <Stack direction="row" spacing={1} onClick={stopRowClick}>
            {submitting ? <CircularProgress size={20} /> :
                <IconButton size="small" color="success" disabled={!isValid} onClick={onSubmit} sx={(theme) => ({ '&:hover': { backgroundColor: alpha(theme.palette.success.main, 0.25) } })}><CheckIcon fontSize="small" /></IconButton>}
            <IconButton size="small" color="error" disabled={submitting} onClick={onCancel} sx={(theme) => ({ '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.25) } })}><CloseIcon fontSize="small" /></IconButton>
        </Stack>
    )
}

const CreateItem = ({ proprietor }) => {

    const [newItem, setNewItem] = useState({ design_number: "", description: "", price: "", underprocessing_value: "" })
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [editingIndex, setEditingIndex] = useState(null)
    const [draft, setDraft] = useState({ description: "", price: "", underprocessing_value: "" })
    const [submitting, setSubmitting] = useState(false)
    const [toastProps, setToastProps] = useState({ open: false, message: "", severity: "success" })

    const onEdit = (index) => {
        setEditingIndex(index)
        setDraft({ description: items[index].description, price: items[index].price, underprocessing_value: items[index].underprocessing_value })
    }

    const onCancel = () => {
        setEditingIndex(null)
    }

    const onUpdate = async () => {
        setSubmitting(true)
        try {
            const res = await updateItem({ design_number: items[editingIndex].design_number, ...draft }, proprietor.proprietor_id)
            setItems(items.map((item, i) => (i === editingIndex ? res.data : item)))
            setEditingIndex(null)
            setToastProps({ open: true, message: "Item updated successfully", severity: "success" })
        }
        catch (err) {
            console.log(err)
            setToastProps({ open: true, message: `Failed to update item: ${err.response?.data?.message || err.message}`, severity: "error" })
        }
        finally {
            setSubmitting(false)
        }
    }

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
        setEditingIndex(null)
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

    const cellProps = { items, editingIndex, draft, setDraft }
    const additionalComponents = [
        { label: "description", component: DescriptionCell, props: cellProps },
        { label: "general_price", component: GeneralPriceCell, props: cellProps },
        { label: "underprocessing_value", component: UnderprocessingValueCell, props: cellProps },
        { label: "edit", component: EditCell, props: { ...cellProps, submitting, onEdit, onCancel, onSubmit: onUpdate } },
        { label: "created_date", component: DateCell, props: { dateKey: "created_date" } },
        { label: "last_updated_date", component: DateCell, props: { dateKey: "last_updated_date" } },
    ]
    const additionalKeys = ["description", "price", "underprocessing_value", "created_date", "last_updated_date"]
    const columns = proprietorDetailsViewConfig['items'].keys.filter((key) => !additionalKeys.includes(key))


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
                <GroupedTable
                    data={items}
                    groupKeys={proprietorDetailsViewConfig['items'].grouping_keys}
                    columns={columns}
                    additionalComponents={additionalComponents}
                    loading={loading}
                    noDataMessage="No Data for Items"
                />
            </Box>
            <Snackbar open={toastProps.open} autoHideDuration={toastProps.severity === "error" ? 10000 : 3000} onClose={() => setToastProps({ ...toastProps, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setToastProps({ ...toastProps, open: false })} severity={toastProps.severity} sx={{ width: '100%' }}>
                    {toastProps.message}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default CreateItem