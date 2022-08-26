import React, {createContext, useReducer} from "react"
import ConvReducer from "./convReducer"

const init_state = {
    conversations: [],
    isFetch: false,
    error: false,
}

export const ConvContext = createContext(init_state)

export const ConvContextProv = ({children}) => {
    const [state, convDispatch] = useReducer(ConvReducer, init_state)

    return (
        <ConvContext.Provider 
            value={state.conversations ? {
                conversations:state.conversations,
                isFetch:state.isFetch,
                error:state.error,
                convDispatch,
            }: init_state}
        >
            {children}
        </ConvContext.Provider>
    )
}