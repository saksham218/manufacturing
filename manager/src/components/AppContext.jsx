import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext()

export const useApp = () => useContext(AppContext)

export const AppProvider = ({ children }) => {
    const [actionsVersion, setActionsVersion] = useState(0)
    const onMutation = useCallback(() => setActionsVersion(v => v + 1), [])
    return <AppContext.Provider value={{ actionsVersion, onMutation }}>{children}</AppContext.Provider>
}
