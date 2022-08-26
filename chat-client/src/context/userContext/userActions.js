export const userStart = (userCreds) => ({
    type:"USER_START"
})

export const userSuccess = (user) => ({
    type:"USER_SUCCESS",
    payload:user,
})

export const userFail = () => ({
    type:"USER_FAIL",
})