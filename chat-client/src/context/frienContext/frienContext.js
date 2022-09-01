import React, {createContext, useReducer, useEffect} from "react"
import FrienReducer from "./frienReducer"

const init_state = {
    friends: [],
    isFetch: false,
    error: false,
}

export const FrienContext = createContext(init_state)

export const FrienContextProv = ({children}) => {
    const [state, frienDispatch] = useReducer(FrienReducer, init_state)

    return (
        <FrienContext.Provider 
            value={ state.friends ?{
                friends:state.friends,
                isFetch:state.isFetch,
                error:state.error,
                frienDispatch,
            }: init_state}
        >
            {children}
        </FrienContext.Provider>
    )
}