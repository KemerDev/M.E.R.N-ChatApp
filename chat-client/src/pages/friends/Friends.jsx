import React,{useState, useContext, useEffect} from 'react'
import { useNavigate, Link } from "react-router-dom"
import { AuthContext } from "../../context/authContext/authContext"
import { FrienContext } from "../../context/frienContext/frienContext"
import { axiosInstance } from '../../config'
import './friends.css'

export default function Friends() {
    const PF = process.env.REACT_APP_PUBLIC_FOLDER_IMAGES
    const BPF = process.env.REACT_APP_PUBLIC_FOLDER_BACKGROUND

    const { token } = useContext(AuthContext)
    const { friends, frienDispatch } = useContext(FrienContext)

    const user = JSON.parse(localStorage.getItem('userData'))

    const [allUsers, setAllUsers] = useState([])

    const getUsersFunc = async () => {
        try {
            const res = await axiosInstance.get("/api/v1/users/getUsers", {
                headers : {authorization : "Bearer "+token}
            })

            setAllUsers(res.data)

        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getUsersFunc()
    }, [])

    const PendingNotif = () => {
        const [pendingAdds, setPendingAdds] = useState([])

        const makeReq = async () => {
            try {
                const res = await axiosInstance.get("/api/v1/users/getRequests/" + user._id, {
                    headers : {authorization : "Bearer "+token}
                })
    
                setPendingAdds(res.data)
    
            } catch (err) {
                console.log(err)
            }
        }

        const PenddingAccept = () => {
            const handleAcceptReq = async (e, userId) => {
                e.preventDefault()
                axiosInstance.put("/api/v1/users/"+user._id+"/friend", {
                    userId : userId
                }, {
                     headers : {authorization : "Bearer "+token}
                }).then(response => {
                    const fd = friends
                    fd.push(response.data.friend)
                    frienDispatch({type:"FRIENDS_SUCCESS", payload: fd})
                    window.location.reload(false)
                }).catch(err => {
                    console.log(err)
                })
            }

            const handleCancelReq = async (e, userId) => {
                e.preventDefault()
                axiosInstance.put("/api/v1/users/"+user._id+"/rejectFriend", {
                    userId : userId
                }, {
                     headers : {authorization : "Bearer "+token}
                }).then(response => {
                    setPendingAdds(response.data.pending)
                }).catch(err => {
                    console.log(err)
                })
            }

            return (
                        <>
                            {pendingAdds.length > 0 ?
                                pendingAdds.map((pe, index) =>
                                    <div className="pendingAddUsers" key={index}>
                                        {
                                            allUsers.map(us => {
                                                if (us._id === pe) {
                                                    return (
                                                        <>
                                                            <img src={BPF + us.coverPic} crossOrigin="anonymous" alt='' className="pendingBackImg"/>
                                                            <img src={PF + us.profilePic} crossOrigin="anonymous"  alt='' className="pendingConvImg"/>
                                                            <span className="pendingName">{us.username}</span>
                                                            <div className="pendingButtons">
                                                                <button onClick={(e) => handleAcceptReq(e, pe)}>Accept</button>
                                                                <button onClick={(e) => handleCancelReq(e, pe)}>Decline</button>
                                                            </div>
                                                        </>
                                                    )
                                                }
                                            })
                                        }
                                    </div>
                                )

                                : 
                                    <span style={{width: '100%', color: 'white', fontSize: '15px', fontWeight: '500', textAlign: 'center'}}>No Friends Pending Accept</span>
                            }


                        </>
            )
        }
    
        useEffect(() => {
            makeReq()
        }, [])
    
        setInterval(makeReq, 120000)

        return (
            <>
                <PenddingAccept/>
            </>
        )
    }

    return (
        <>  
            {token ?      
                <div className="friendsContainer">
                    <div className="friendsWrap">
                        <Link to="/home">
                            <div className="exitButtonCont">
                                <div className="exitButtonWrap">
                                    <span>✖</span>
                                </div>
                            </div>
                        </Link>
                        <div className="friendsWrapSet">
                            <div className="friendsPendingText">
                                <span>Pending Accept</span>
                            </div>
                            <div className="friendsPendingCont">
                                <PendingNotif />
                            </div>
                        </div>
                    </div>
                </div>
        
                :
                <div className="settingErr">
                    <span>You shouldn't be here</span>
                </div>
            }
        </>
    )
}