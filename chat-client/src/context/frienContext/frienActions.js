export const frienStart = (userCreds) => ({
    type:"FRIENDS_START"
})


export const frienSuccess = (friends) => ({
    type:"FRIENDS_SUCCESS",
    payload: friends,
})

export const frienFail = () => ({
    type:"FRIENDS_FAIL"
})