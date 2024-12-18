import { createContext, useContext, useState } from 'react'

const ManagerContext = createContext()

export const useManager = () => {
    return useContext(ManagerContext)
}

export const ManagerProvider = ({ children }) => {

    const [manager, setManager] = useState({})

    return (
        <ManagerContext.Provider value={{ manager, setManager }}>
            {children}
        </ManagerContext.Provider>
    )
}
