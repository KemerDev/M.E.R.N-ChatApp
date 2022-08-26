const UserReducer = (state, action) => {
    switch(action.type) {
        case "USER_START":
            return {
                user: {},
                isFetch: true,
                error: false,
            }
        
        case "USER_SUCCESS":
            return {
                user: action.payload,
                isFetch: false,
                error: false,
            }
        
        case "USER_UPDATE":
            return {
                user: {},
                isFetch: false,
                error: false,
            }
        
        case "USER_FAIL":
            return {
                user: {},
                isFetch: false,
                error: action.payload,
            }
        
        default:
            return state
    }
}

export default UserReducer