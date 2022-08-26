import {axiosInstance} from "./config"
import axios from "axios"

// api κληση για την συνδεση του χρηστη
export const logincall = (userCreds, dispatch) => {
    dispatch({type:"LOGIN_START"})

    axiosInstance.post("/api/v1/auth/login", userCreds)
        .then(res => {
            const token = res.headers["x-auth"].split(" ")[1]
            dispatch({ type:"LOGIN_SUCCESS" , payload:token})
        })
        .catch(function (err) {
            if (err.response) {
                dispatch({ type:"LOGIN_FAIL" ,payload:err.response.data.message })
            }
        })
}

// api κληση για να παρουμε το array με ολους τους φιλους

export const friendsCall = (userCreds, frieDispatch) => {
    frieDispatch({type:"FRIENDS_START"})

    axiosInstance.get("/api/v1/users/friends/"+userCreds.dataId, {
        headers: {authorization : "Bearer "+userCreds.dataToken,
        'Cache-Control': 'no-cache',
        'Pragma' : 'no-cache',
        'Expires' : '0',
        }
    }).then(res => {
        const friends = res.data
        frieDispatch({type:"FRIENDS_SUCCESS", payload:friends})
    }).catch(function (err) {
        if (err.response) {
            frieDispatch({type:"FRIENDS_FAIL", payload:err.response})
        }
    })
}

// api κληση για να παρουμε τις φωτογραφιες απο ολους του φιλους και την δικια μας
export const photoCall = (userCreds, photoDispatch) => {

    photoDispatch({type:"PHOTO_START"})
    const PF = process.env.REACT_APP_PUBLIC_FOLDER_IMAGES
    const BPF = process.env.REACT_APP_PUBLIC_FOLDER_BACKGROUND

    const getAll = {}
    const getPhoto = []
    const getBackGround = []
    const getIds = []


    userCreds.friends.map((f) => (
        getIds.push(f._id),
        getPhoto.push(axiosInstance.get(PF + f.profilePic, {responseType: 'blob'})),
        getBackGround.push(axiosInstance.get(BPF + f.coverPic, {responseType: 'blob'}))
    ))

    getPhoto.push(axiosInstance.get(PF + userCreds.user.profilePic, {responseType: 'blob'}))
    getBackGround.push(axiosInstance.get(BPF + userCreds.user.coverPic, {responseType: 'blob'}))
    getIds.push(userCreds.user._id)

    axios.all(getPhoto)
    .then(axios.spread((...responses) => {
        for (let i = 0; i < getIds.length; i++) {
            getAll[getIds[i]] = {...getAll[getIds[i]], 'profilePic' : URL.createObjectURL(responses[i].data)}
        }
    }))
    .catch(err => {
        if (err.response) {
            photoDispatch({ type:"PHOTO_FAIL" ,payload:err.response })
        }
    })

    axios.all(getBackGround)
    .then(axios.spread((...responses) => {
        for (let i = 0; i < getIds.length; i++) {
            getAll[getIds[i]] = {...getAll[getIds[i]], 'coverPic' : URL.createObjectURL(responses[i].data)}
        }
    }))
    .catch(err => {
        if (err.response) {
            photoDispatch({ type:"PHOTO_FAIL" ,payload:err.response })
        }
    })

    photoDispatch({type:'PHOTO_SUCCESS', payload:getAll})
}

// api Κληση για να παρουμε ολα τα conversations του χρηστη
export const conversationsCall = (userCreds, convDispatch) => {
    convDispatch({type:"CONVER_START"})

    axiosInstance.get("/api/v1/conversations/"+userCreds.dataId, {
        headers: {authorization : "Bearer "+userCreds.dataToken,
        'Cache-Control': 'no-cache',
        'Pragma' : 'no-cache',
        'Expires' : '0',
        }
    }).then(res => {
        const conversations = res.data
        convDispatch({type:"CONVER_SUCCESS", payload:conversations})
    }).catch(function (err) {
        if (err.response) {
            convDispatch({type:"CONVER_FAIL", payload:err.response})
        }
    })
}

export const messagesCall = (userCreds, messDispatch) => {
    messDispatch({type:"MESS_START"})

    let messList = []
    
    for (let i in userCreds.conver) {
        axiosInstance.get("/api/v1/messages/"+userCreds.conver[i]._id, {
            headers: {authorization : "Bearer "+userCreds.dataToken,
            'Cache-Control': 'no-cache',
            'Pragma' : 'no-cache',
            'Expires' : '0',
            }
        }).then(res => {
            messList.push(res.data)
        }).catch(function(err) {
            messDispatch({type:"MESS_FAIL", payload:err.responce})
        })
    }

    messDispatch({type:"MESS_SUCCESS", payload: messList})
}