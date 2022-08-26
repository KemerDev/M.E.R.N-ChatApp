import React, {createContext, useReducer} from "react"
import MessReducer from './messReducer'

const init_state = {
    messages: [],
    isFetch: false,
    error: false,
}

export const MessContext = createContext(init_state)

export const MessContextProv = ({children}) => {
    const [state, messDispatch] = useReducer(MessReducer, init_state)

    return (
        <MessContext.Provider
            value={state.messages ? {
                messages: state.messages,
                isFetch: state.isFetch,
                error: state.error,
                messDispatch,
            }: init_state}
        >
            {children}
        </MessContext.Provider>
    )
}