import React, { createContext, useReducer, useEffect } from "react";
import AuthReducer from "./authReducer";
import { decrypt, encrypt } from "../../cryptor"

//sharing all this infos with app.js
const init_state = {
    token : localStorage.getItem("token") || null,
    isFetch: false,
    error: false
}

export const AuthContext = createContext(init_state)
//application wrapper, children can be App.js or index.js
//current user can be reached anywhere in the app
export const AuthContextProv = ({children}) => {
    const [state, dispatch] = useReducer(AuthReducer, init_state)

    useEffect(()=>{
        if (state.token !== null) {
            localStorage.setItem("token", state.token)
        }
    }, [state.token])
    
    return (
        <AuthContext.Provider 
            value={{
                token:state.token,
                isFetch:state.isFetch,
                error:state.error,
                dispatch,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}