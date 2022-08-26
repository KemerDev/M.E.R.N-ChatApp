export const photoStart = (userCreds) => ({
    type:"PHOTO_START"
})

export const photoSuccess = (photos) => ({
    type:"PHOTO_SUCCESS",
    payload:photos,
})

export const photosFail = () => ({
    type:"PHOTO_FAIL",
})