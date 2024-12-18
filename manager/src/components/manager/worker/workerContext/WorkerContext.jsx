import { useState, useContext, createContext } from "react"

const WorkerContext = createContext()

export const useWorker = () => {
    return useContext(WorkerContext)
}

export const WorkerProvider = ({ children }) => {

    const [worker, setWorker] = useState({})

    return (
        <WorkerContext.Provider value={{ worker, setWorker }}>
            {children}
        </WorkerContext.Provider>
    )

}