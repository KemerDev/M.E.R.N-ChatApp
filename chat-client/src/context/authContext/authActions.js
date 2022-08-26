//Actions based on login status
export const loginStart = (userCreds) => ({
    type:"LOGIN_START",
})

export const loginSuccess = (token) => ({
    type:"LOGIN_SUCCESS",
    payload: token,
})

export const loginFail = () => ({
    type:"LOGIN_FAIL"
})