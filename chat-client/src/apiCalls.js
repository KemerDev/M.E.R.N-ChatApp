import {axiosInstance} from "./config"
import jwt from 'jwt-decode'
import { decrypt, encrypt } from "./cryptor"

export const logincall = (userCreds, dispatch) => {
    dispatch({type:"LOGIN_START"})

    axiosInstance.post("/api/v1/auth/login", userCreds)
        .then(res => {
            const token = res.headers["x-auth"].split(" ")[1]

            localStorage.setItem('userData', encrypt(jwt(decrypt(token))))
            dispatch({ type:"LOGIN_SUCCESS" , payload:token})
        })
        .catch(function (err) {
            if (err.response) {
                dispatch({ type:"LOGIN_FAIL", payload:err.response.data.message })
            }
        })
}

// api κληση για να παρουμε το array με ολους τους φιλους
export const friendsCall = (userCreds, frienDispatch) => {

    frienDispatch({type:"FRIENDS_START"})

    axiosInstance.get("/api/v1/users/friends/"+userCreds.dataId, {
        headers: {authorization : "Bearer "+userCreds.dataToken,
        'Cache-Control': 'no-cache',
        'Pragma' : 'no-cache',
        'Expires' : '0',
        }
    }).then(res => {
        const friends = res.data
        frienDispatch({type:"FRIENDS_SUCCESS", payload: friends})
        
    }).catch(function (err) {
        if (err.response) {
            frienDispatch({type:"FRIENDS_FAIL", payload: err.response})
        }
    })
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