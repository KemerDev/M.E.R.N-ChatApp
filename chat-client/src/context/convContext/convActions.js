export const convStart = (userCreds) => ({
    type:"CONVER_START"
})


export const convSuccess = (conversations) => ({
    type:"CONVER_SUCCESS",
    payload: conversations,
})

export const convFail = () => ({
    type:"CONVER_FAIL"
})