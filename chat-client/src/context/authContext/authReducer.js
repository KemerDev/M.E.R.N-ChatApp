const AuthReducer = (state, action) => {
    switch(action.type) {
        case "LOGIN_START":
           return {
               token:null,
               isFetch:true,
               error:false,
           }

        case "LOGIN_SUCCESS":
            return {
                token:action.payload,
                isFetch:false,
                error:false,
            }

        case "LOGIN_FAIL":
            return {
                token:null,
                isFetch:false,
                error:action.payload,
            }

        default:
            return state
    }
}

export default AuthReducer