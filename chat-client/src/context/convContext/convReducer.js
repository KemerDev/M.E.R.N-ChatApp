const ConvReducer = (state, action) => {
    switch(action.type) {
        case "CONVER_START":
            return {
                conversations: [],
                isFetch: true,
                error: false,
            }
            
        case "CONVER_SUCCESS":
            return {
                conversations: action.payload,
                isFetch: false,
                error: false,
            }
        
        case "CONVER_FAIL":
            return {
                conversations: [],
                isFetch: false,
                error: action.payload,
            }

        default:
            return state
    }
}

export default ConvReducer