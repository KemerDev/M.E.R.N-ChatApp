import React, {createContext, useReducer} from "react"
import FriendReducer from "./friendReducer"

const init_state = {
    friends: [],
    isFetch: false,
    error: false,
}

export const FriendContext = createContext(init_state)

export const FriendContextProv = ({children}) => {
    const [state, frieDispatch] = useReducer(FriendReducer, init_state)

    return (
        <FriendContext.Provider 
            value={state.friends ? {
                friends:state.friends,
                isFetch:state.isFetch,
                error:state.error,
                frieDispatch,
            }: init_state}
        >
            {children}
        </FriendContext.Provider>
    )
}