export const messStart = (userCreds) => ({
    type:"MESS_START"
})

export const messSuccess = (messages) => ({
    type:"MESS_SUCCESS",
    payload:messages,
})

export const messFail = () => ({
    type:"MESS_FAIL"
})