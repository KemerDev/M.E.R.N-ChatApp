import React, {createContext, useReducer, useEffect} from "react"
import UserReducer from './userReducer'

const init_state = {
    user: JSON.parse(localStorage.getItem("userLocal")) || {},
    isFetch: false,
    error: false,
}

export const UserContext = createContext(init_state)

export const UserContextProv = ({children}) => {
    const [state, userDispatch] = useReducer(UserReducer, init_state)

    useEffect(()=>{
        if (state.user) {
            localStorage.setItem("userLocal", JSON.stringify(state.user))
        }
    }, [state.user])

    return (
        <UserContext.Provider
            value={state.user ? {
                user: state.user,
                isFetch: state.isFetch,
                error: state.error,
                userDispatch,
            }: init_state}
        >
            {children}
        </UserContext.Provider>
    )
}