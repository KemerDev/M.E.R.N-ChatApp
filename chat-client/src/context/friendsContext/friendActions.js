export const frieStart = (userId) => ({
    type:"FRIEND_START"
})

export const frieSuccess = (friends) => ({
    type:"FRIEND_SUCCESS",
    payload: friends,
})

export const frieFail = () => ({
    type:"FRIEND_FAIL"
})