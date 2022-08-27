import React,{ useContext, useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../../context/authContext/authContext"
import { UserContext } from "../../context/userContext/userContext"
import { FriendContext } from "../../context/friendsContext/friendContext"
import {Search, Person, Chat, Notifications} from "@material-ui/icons"
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft'
import { axiosInstance } from "../../config"
import "./topbar.css"

// Πρωτα εφτιαξα αυτο

export default function Topbar() {
    const PF = process.env.REACT_APP_PUBLIC_FOLDER_IMAGES
    const BPF = process.env.REACT_APP_PUBLIC_FOLDER_BACKGROUND

    const [allUsers, setAllUsers] = useState([])
    const [addedUsers, setAddedUsers] = useState([])

    // περνουμε το token απο το context
    const {token} = useContext(AuthContext)
    const {user} = useContext(UserContext)
    const {friends, frieDispatch} = useContext(FriendContext)

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

        return () => {
            console.log("This will be logged on unmount");
          }
    }, [])

    //
    const handleFriendReq = async (e, userId) => {
        e.preventDefault()

        try {
            await axiosInstance.put("/api/v1/users/"+ user._id +"/friendReq", 
            {
                userId : userId
            },
            {
                headers : {authorization : "Bearer "+token}
            })

        } catch (err) {
            console.log(err)
        }

        try {
            const res = await axiosInstance.get("/api/v1/users/getAdditions/" + user._id, {
                headers : {authorization : "Bearer "+token},
            })

            setAddedUsers(res.data)
        } catch (err) {
            console.log(err)
        }
    }

    const handleCancelFriendReq = async (e, userId) => {
        e.preventDefault()

        try {
            await axiosInstance.put("/api/v1/users/"+ user._id +"/cancelFriendReq", 
            {
                userId : userId
            },
            {
                headers : {authorization : "Bearer "+token}
            })

        } catch (err) {
            console.log(err)

        }

        try {
            const res = await axiosInstance.get("/api/v1/users/getAdditions/" + user._id, {
                headers : {authorization : "Bearer "+token},
            })

            setAddedUsers(res.data)
        } catch (err) {
            console.log(err)
        }
    }

    const FoundAddCancel = ({f}) => {
        return (
            <>
            {addedUsers.includes(f._id)
                ?
                <div className="foundCancelContainer" onClick={e => {handleCancelFriendReq(e, f._id)}}>
                    <PersonRemoveIcon/>
                </div>
                :
                <div className="foundAddContainer" onClick={e => {handleFriendReq(e, f._id)}}>
                    <PersonAddIcon/>
                </div>
            }
            </>
        )
    }


    const InputFound = ({found, search}) => {
        return (
            <>
                {search ? 
                    <div className="foundContainer" style={{display: 'block'}}>
                        {found.map((f, index) => ( index < 5 ?
                            <div className="foundIdiv">
                                <img src={BPF + f.coverPic} crossOrigin="anonymous" alt='' className="foundBackImg"/>
                                <img src={PF + f.profilePic} crossOrigin="anonymous"  alt='' className="foundConvImg" />
                                <span className="foundName">{f.username}</span>
                                <FoundAddCancel f={f}/>
                            </div>
                        : null))}
                    </div>
                : 
                    <div className="foundContainer" style={{display: 'none'}}>
                    </div>
                }
            </>
        )
    }

    const InputSearch = () => {

        const [search, setSearch] = useState("")
        const [found, setFound] = useState([])
        
        //&& fs.username.toLowerCase() !== friends.map(fs => fs.username.toLowerCase()

        const newFriends = friends.map(fr => fr.username)

        useEffect(() => {
            if (search) {
                const foundUsers = allUsers.filter(us => us.username.toLowerCase().indexOf(search.toLowerCase()) === 0 && us.username.toLowerCase().includes(search.toLowerCase()) 
                                                        && us.username.toLowerCase() !== user.username.toLowerCase() && !newFriends.includes(us.username))
                setFound(foundUsers)
            }
        }, [search])

        
        return (
            <>
                <input placeholder="Search for friends" type="text" onChange={(e) => setSearch(e.target.value)} value={search} className="topSearchInput" />
                <InputFound found={found} search={search}/>
            </>
        )
    }

    const PendingNotif = () => {
        const [pendingAdds, setPendingAdds] = useState([])
        const [clickAdd, setClickAdd] = useState(false)

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
            const [openAddCancel, setOpenAddCancel] = useState({load : false, kks : undefined})

            const handleAcceptReq = async (e, userId) => {
                e.preventDefault()
                axiosInstance.put("/api/v1/users/"+user._id+"/friend", {
                    userId : userId
                }, {
                     headers : {authorization : "Bearer "+token}
                }).then(response => {
                    window.location.reload(false)
                }).catch(err => {
                    console.log(err)
                })
            }

            const handleCancelReq = (e, userId) => {
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
                <div className="pendingUsersContainer" style={clickAdd ? {display: 'block'} : {display: 'none'}}>
                    <div className="pendingUsersWrapper">
                        {
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
                                                            <div className="pendingAddBut" onClick={() => !openAddCancel.load ? setOpenAddCancel({load : true, kks : index}) : setOpenAddCancel({load : false, kks : index})}>
                                                                <SubdirectoryArrowLeftIcon id="pendingAddButIcon" />
                                                            </div>
                                                        </>
                                                    )
                                                }
                                            })
                                        }
                                        {   
                                            openAddCancel.load && openAddCancel.kks === index ?        
                                                <div className="pendingAcceptCancelCont">
                                                    <button onClick={(e) => handleAcceptReq(e, pe)}>Accept</button>
                                                    <button onClick={(e) => handleCancelReq(e, pe)}>Decline</button>
                                                </div>
                                            : null
                                        }
                                    </div>
                                )
                        }
                    </div>
                </div>
            )
        }
    
        useEffect(() => {
            makeReq()
        }, [])
    
        setInterval(makeReq, 120000)

        return (
            <>
                <div className="topRightItem">
                    <Person className="topRightCom" onClick={() => !clickAdd ? setClickAdd(true) : setClickAdd(false)}/>
                    <span className="ItemNotif">{pendingAdds.length}</span>
                </div>
                <PenddingAccept/>
            </>
        )
    }

    return (
        // container του header
        <div className = "topContainer">
            {/* αριστερα του header*/}
            <div className = "topLeft">
                <Link to="/" style={{textDecoration: "none"}}>
                    <span className="topLogo">TextMe</span>
                </Link>
            </div>

            {/* κεντρο του header */}
            <div className="topCenter">
                <div className="topSearchBar">
                    <Search className="topSearchBarIcon" />
                    <InputSearch />
                </div>
            </div>

            <div className="topRight">
                <div className="topRightIcons">
                    {/* το containter των εικονιδιων και τον notification τους*/}
                    <PendingNotif />
                </div>
            </div>
        </div>
    )
}
