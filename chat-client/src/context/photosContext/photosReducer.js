const PhotoReducer = (state, action) => {
    switch(action.type) {
        case "PHOTO_START":
            return {
                photos: {},
                isFetch: true,
                error: false,
            }

        case "PHOTO_SUCCESS":
            return {
                photos: action.payload,
                isFetch: false,
                error: false,
            }

        case "PHOTO_FAIL":
            return {
                photos: {},
                isFetch: false,
                error: action.payload,
            }
        
            default:
                return state
    }
}

export default PhotoReducer