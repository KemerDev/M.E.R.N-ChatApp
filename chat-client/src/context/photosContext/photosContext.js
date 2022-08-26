import React, {createContext, useReducer, useEffect} from 'react'
import PhotoReducer from './photosReducer'

const init_state = {
    photos: JSON.parse(localStorage.getItem("photos")) || {},
    isFetch: false,
    error: false,
}

export const PhotoContext = createContext(init_state)

export const PhotoContextProv = ({children}) => {
    const [state, photoDispatch] = useReducer(PhotoReducer, init_state)

    useEffect(()=>{
        if (state.photos !== {}) {
            localStorage.setItem("photos", JSON.stringify(state.photos))
        }
    }, [state.photos])

    return (
        <PhotoContext.Provider 
            value={state.photos ? {
                photos: state.photos,
                isFetch: state.isFetch,
                error: state.error,
                photoDispatch,
            } : init_state}
        >
            {children}
        </PhotoContext.Provider>
    )
}