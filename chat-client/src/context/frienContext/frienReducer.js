const FrienReducer = (state, action) => {
    switch(action.type) {
        case "FRIENDS_START":
            return {
                friends: [],
                isFetch: true,
                error: false,
            }
            
        case "FRIENDS_SUCCESS":
            return {
                friends: action.payload,
                isFetch: false,
                error: false,
            }
        
        case "FRIENDS_FAIL":
            return {
                friends: [],
                isFetch: false,
                error: action.payload,
            }

        default:
            return state
    }
}

export default FrienReducer