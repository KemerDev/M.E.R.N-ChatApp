const MessReducer = (state, action) => {
    switch(action.type) {
        case "MESS_START":
            return {
                messages: [],
                isFetch: true,
                error: false,
            }
        
        case "MESS_SUCCESS":
            return {
                messages: action.payload,
                isFetch: false,
                error: false,
            }
        
        case "MESS_UPDATE":
            return {
                messages: [],
                isFetch: false,
                error: false,
            }
        
        case "MESS_FAIL":
            return {
                messages: [],
                isFetch: false,
                error: action.payload,
            }
        
        default:
            return state
    }
}

export default MessReducer