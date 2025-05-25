import React, { useState } from 'react'
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material'

const CustomButton = ({ buttonProps, isInputValid, onClick, successMessage, errorMessage, children }) => {

    const [disabled, setDisabled] = useState(false)
    const [loading, setLoading] = useState(false)
    const [toastProps, setToastProps] = useState({ open: false, message: "", severity: "success", duration: 3000 })

    const handleButtonClick = async () => {
        setDisabled(true)
        setLoading(true)
        try {
            await onClick()
            // await new Promise((resolve) => setTimeout(resolve, 3000));
            setToastProps({ ...toastProps, open: true, message: successMessage, severity: "success", duration: 3000 })
        }
        catch (err) {
            console.log(err)
            setToastProps({ ...toastProps, open: true, message: `${errorMessage}: ${err.response?.data?.message || err.message}`, severity: "error", duration: 10000 })
        }
        finally {
            setDisabled(false)
            setLoading(false)
        }
    }



    return (
        <>
            <Button {...buttonProps} disabled={disabled || !isInputValid} onClick={handleButtonClick} >
                {loading ? <CircularProgress size={20} /> : children}
            </Button>
            <Snackbar open={toastProps.open} autoHideDuration={toastProps.duration} onClose={() => setToastProps({ ...toastProps, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setToastProps({ ...toastProps, open: false })} severity={toastProps.severity} sx={{ width: '100%' }}>
                    {toastProps.message}
                </Alert>
            </Snackbar>
        </>
    )
}

export default CustomButton