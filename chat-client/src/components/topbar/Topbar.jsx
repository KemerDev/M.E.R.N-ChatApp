import React,{ useContext, useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../../context/authContext/authContext"
import { FrienContext } from '../../context/frienContext/frienContext'
import {Search} from "@material-ui/icons"
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import { axiosInstance } from "../../config"
import { decrypt } from "../../cryptor"
import "./topbar.css"

// Πρωτα εφτιαξα αυτο

export default function Topbar() {
    const PF = process.env.REACT_APP_PUBLIC_FOLDER_IMAGES
    const BPF = process.env.REACT_APP_PUBLIC_FOLDER_BACKGROUND

    const [allUsers, setAllUsers] = useState([])
    const [addedUsers, setAddedUsers] = useState([])

    // περνουμε το token απο το context
    const {token} = useContext(AuthContext)
    const {friends} = useContext(FrienContext)

    const user = JSON.parse(decrypt(localStorage.getItem('userData')))

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
                        {found.length > 0 ?
                            found.map((f, index) => ( index < 5 ?
                                <div className="foundIdiv">
                                    <img src={BPF + f.coverPic} crossOrigin="anonymous" alt='' className="foundBackImg"/>
                                    <img src={PF + f.profilePic} crossOrigin="anonymous"  alt='' className="foundConvImg" />
                                    <span className="foundName">{f.username}</span>
                                    <FoundAddCancel f={f}/>
                                </div>
                            : null)) : <span>No Users Found With That Username</span>}
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
                <div className="topSearchBar">
                    <Search className="topSearchBarIcon" />
                    <input placeholder="Search for friends" type="text" onChange={(e) => setSearch(e.target.value)} value={search} className="topSearchInput" />
                    <InputFound found={found} search={search}/>
                </div>
            </>
        )
    }

    return (
        // container του header
        <div className = "topContainer">
            {/* αριστερα του header*/}
            <div className = "topLeft">
                <Link to="/" style={{textDecoration: "none"}}>
                    <span className="topLogo">TextMeUp</span>
                </Link>
            </div>

            {/* κεντρο του header */}
            <div className="topCenter">
                <InputSearch />
            </div>
        </div>
    )
}
