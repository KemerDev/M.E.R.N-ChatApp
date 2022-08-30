import React,{ useContext, useState, useEffect } from "react"
import { Link } from 'react-router-dom'
import { axiosInstance} from "../../config"
import { AuthContext } from "../../context/authContext/authContext"
import { UserContext } from "../../context/userContext/userContext"
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import './settings.css'

export default function Settings() {

    const {token} = useContext(AuthContext)
    const {user, userDispatch} = useContext(UserContext)

    const [butPress, setButPress] = useState("")
    const [imageBrowseOpen, setImageBrowseOpen] = useState(false)
    const [coverBrowseOpen, setCoverBrowseOpen] = useState(false)

    const PF = process.env.REACT_APP_PUBLIC_FOLDER_IMAGES
    const BPF = process.env.REACT_APP_PUBLIC_FOLDER_BACKGROUND

    const replaceBetween = () => {
        var papIdx = 0

        let email = user.email

        let sliceEmail = undefined

        let newEmail = undefined

        for (var i = 0; i < email.length; i++) {
            if (email[i] === "@") {
                papIdx = i
            }
        }

        sliceEmail = user.email.slice(papIdx)

        newEmail = user.email[0] + "********" + sliceEmail

        return newEmail
    }

    const PopUp = () => {

        const [values1, setValues1] = useState({Username : "", Password : ""})
        const [values2, setValues2] = useState({Email : "", ReEmail : "", Password : ""})
        const [values3, setValues3] = useState({OldPassword : "", Password : "", RePassword : ""})
        const [showError, setShowError] = useState("")
        const [showSuccess, setShowSuccess] = useState("")

        const handleChangeUs = (e) => {
            setValues1({ ...values1, [e.target.name] : e.target.value})
        }

        const handleChangeEm = (e) => {
            setValues2({ ...values2, [e.target.name] : e.target.value})
        }

        const handleChangePas = (e) => {
            setValues3({ ...values3, [e.target.name] : e.target.value})
        }

        const handleSubmit = (e) => {
            e.preventDefault()

            if (butPress === "username") {
                axiosInstance.put("/api/v1/users/usernameCh/" + user._id, {
                    username : values1.Username,
                    password : values1.Password
                }, {
                    headers: {authorization : "Bearer "+token}
                }).then(response => {
                    setShowSuccess(response.data.message)
                }).then(data => {
                    const new_user = {...user, username : values1.Username}
                    localStorage.removeItem("userLocal")
                    localStorage.setItem("userLocal", JSON.stringify(new_user))
                    userDispatch({type:"USER_SUCCESS", payload: new_user})
                }).catch(error => {
                    setShowError(error.response.data.message)
                })
            }

            if (butPress === "email") {
                axiosInstance.put("/api/v1/users/emailCh/" + user._id, {
                    email : values2.Email,
                    ReEmail : values2.ReEmail,
                    password : values2.Password
                }, {
                    headers: {authorization : "Bearer "+token}
                }).then(response => {
                    setShowSuccess(response.data.message)
                }).then(data => {
                    const new_user = {...user, email : values2.Email}
                    localStorage.removeItem("userLocal")
                    localStorage.setItem("userLocal", JSON.stringify(new_user))
                    userDispatch({type:"USER_SUCCESS", payload: new_user})
                }).catch(error => {
                    setShowError(error.response.data.message)
                })
            }

            if (butPress === "password") {
                axiosInstance.put("/api/v1/users/passwordCh/" + user._id, {
                    OldPassword : values3.OldPassword,
                    password : values3.Password,
                    RePassword : values3.RePassword,
                }, {
                    headers: {authorization : "Bearer "+token}
                }).then(response => {
                    setShowSuccess(response.data.message)
                }).catch(error => {
                    setShowError(error.response.data.message)
                })

            }
        }

        return (
            <>
                <div className="popUpWindowChange" style = {butPress === "username" ? {visibility: "visible"} : {visibility: "hidden"}}>
                    <>
                        <div className="MessageEditErr" style={ showError ? {visibility: 'visible'} : {visibility: 'hidden'}}>
                            <span className="MessageErr">{showError}</span>
                            <span className="MessageClose" onClick={() => setShowError("")}>✖</span>
                        </div>
                    </>

                    <>
                        <div className="MessageEditErr" style={showSuccess ? {visibility: 'visible', backgroundColor:"green"} : {visibility: 'hidden'}}>
                            <span className="MessageErr">{showSuccess}</span>
                            <span className="MessageClose" onClick={() => setShowSuccess("")}>✖</span>
                        </div>
                    </>

                    <div className="popUpWindowWrap">
                        <div className="spanPopUpWindow">
                            <span>Change Your Username</span>
                            <span>Enter a new username and your current password</span>
                        </div>
                        <div className="popUpWindowFormCont">
                            <form className="popUpWindowForm" onSubmit={handleSubmit}>
                                <input placeholder="username" type="username" className="popUpWindowEditInput" onChange={handleChangeUs} value={values1.Username}  name="Username" required/>

                                <input placeholder="password" type="password" className="popUpWindowEditInput" onChange={handleChangeUs} value={values1.Password} name="Password"  required/>

                                <button className="popUpWindowSubButton" type="submit"> Submit </button>
                            </form>
                            <button className="popUpWindowCanButton" value="" onClick={e => setButPress(e.target.value)}> Cancel </button>
                        </div>
                    </div>
                </div>

                <div className="popUpWindowChange" style = {butPress === "email" ? {visibility: "visible"} : {visibility: "hidden"}}>
                    <div className="popUpWindowWrap">
                        <div className="spanPopUpWindow">
                            <span>Change Your Email</span>
                            <span>Enter a new Email and Re enter it again along with your password</span>
                        </div>
                        <div className="popUpWindowFormCont">
                            <form className="popUpWindowForm" onSubmit={handleSubmit}>
                                <input placeholder="email" type="email" className="popUpWindowEditInput" onChange={handleChangeEm} value={values2.Email}  name="Email" required/>

                                <input placeholder="re-enter email" type="email" className="popUpWindowEditInput" onChange={handleChangeEm} value={values2.ReEmail} name="ReEmail"  required/>

                                <input placeholder="password" type="password" className="popUpWindowEditInput" onChange={handleChangeEm} value={values2.Password} name="Password"  required/>

                                <button className="popUpWindowSubButton" type="submit"> Submit </button>
                            </form>
                            <button className="popUpWindowCanButton" value="" onClick={e => setButPress(e.target.value)}> Cancel </button>
                        </div>
                    </div>
                </div>

                <div className="popUpWindowChange" style = {butPress === "password" ? {visibility: "visible"} : {visibility: "hidden"}}>
                    <div className="popUpWindowWrap">
                        <div className="spanPopUpWindow">
                            <span>Change Your Password</span>
                            <span>Enter a new password and re enter it again</span>
                        </div>
                        <div className="popUpWindowFormCont">
                            <form className="popUpWindowForm" onSubmit={handleSubmit}>

                                <input placeholder="Old password" type="password" className="popUpWindowEditInput"  onChange={handleChangePas} value={values3.OldPassword} name="OldPassword" required/>

                                <input placeholder="password" type="password" className="popUpWindowEditInput"  onChange={handleChangePas} value={values3.Password} name="Password" required/>

                                <input placeholder="re-enter password" type="password" className="popUpWindowEditInput"  onChange={handleChangePas} value={values3.RePassword}  name="RePassword"  required/>

                                <button className="popUpWindowSubButton" type="submit"> Submit </button>
                            </form>
                            <button className="popUpWindowCanButton" value="" onClick={e => setButPress(e.target.value)}> Cancel </button>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    const ImageBrowseComp = () => {
        const [selectedFile, setSelectedFile] = useState()
        const [isSelected, setIsSelected] = useState(false)
        const [showError, setShowError] = useState("")

        const changeHandler = (event) => {
            if (event.target.files[0].type === 'image/jpeg' || event.target.files[0].type === 'image/jpg' || event.target.files[0].type === 'image/png') {
                if (event.target.files[0].size < 8388608) {
                    const keep_prev = event.target.files[0]
        
                    if (!event.target.files[0]) {
                        setSelectedFile(keep_prev)
                        setIsSelected(false)
                    } else {
                        setSelectedFile(event.target.files[0])
                        setIsSelected(true)
                    }
                } else {
                    setShowError("Image Size Must Be Smaller Than 8MB")
                }
            } else {
                setShowError("Image Must Be Jpeg,Jpg or Png format")
            }
        }

        const handleImageUpload = (e) => {
            e.preventDefault()
            const ImgFormData = new FormData()
            ImgFormData.append("image", selectedFile)

            axiosInstance.post("upload/image/"+ user._id, ImgFormData, {
                headers: {authorization : "Bearer "+token, 'Content-Type': "multipart/form-data"}
            }).then((response) => {
                const new_user = {...user, profilePic : response.data.filename}
                localStorage.removeItem("userLocal")
                localStorage.setItem("userLocal", JSON.stringify(new_user))
            }).then(data => {
                window.location.reload(false)
            }).catch((error) => {
                console.log(error)
            })
        }


        return (
            <>
                <div className="imageBrowserCont">
                    <div className="MessageEditErr" style={ showError ? {visibility: 'visible'} : {visibility: 'hidden'}}>
                        <span className="MessageErr">{showError}</span>
                        <span className="MessageClose" onClick={() => setShowError("")}>✖</span>
                    </div>
                    <div className="imageBrowserWrap">
                        <div className="exitButtonCont" onClick={() => setImageBrowseOpen(false)}>
                            <div className="exitButtonWrap">
                                <span>✖</span>
                            </div>
                        </div>
                        <div className="imageBrowserProps">
                            <span>Select An image</span>
                            <div className="imageBrowserSelectBox">
                                {!isSelected 
                                ?
                                    <>
                                        <div className="imageBrowserSelectBoxIcon">
                                            <AddPhotoAlternateIcon className="imageBrowserSelectIcon" style={{fontSize: '30px', color: 'white'}}/>
                                            <input type="file" onChange={changeHandler} accept=".jpg,.jpeg,.png" style={{opacity: 0, width: '10rem', height: '10rem', borderRadius: '1000px', cursor: 'pointer'}}/>
                                        </div>
                                    </>
                                :
                                    <>  
                                        <div className="imageBrowserSelectBoxIcon">
                                            <img src={URL.createObjectURL(selectedFile)} alt="" crossOrigin="anonymous" />
                                            <input type="file" onChange={changeHandler} accept=".jpg,.jpeg,.png" style={{opacity: 0, width: '10rem', height: '10rem', borderRadius: '1000px', cursor: 'pointer', position: 'absolute', right: '0'}}/>
                                        </div>
                                        <div className="imageBrowserSelectBoxIconButton">
                                            <button className="handleImageUploadButton" onClick={(e) => handleImageUpload(e)}>Upload Image</button>
                                        </div>
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    const CoverBrowseComp = () => {
        const [selectedFile, setSelectedFile] = useState()
        const [isSelected, setIsSelected] = useState(false)
        const [showError, setShowError] = useState("")

        const changeHandler = (event) => {
            if (event.target.files[0].type === 'image/jpeg' || event.target.files[0].type === 'image/jpg' || event.target.files[0].type === 'image/png') {
                if (event.target.files[0].size < 8388608) {
                    const keep_prev = event.target.files[0]
        
                    if (!event.target.files[0]) {
                        setSelectedFile(keep_prev)
                        setIsSelected(false)
                    } else {
                        setSelectedFile(event.target.files[0])
                        setIsSelected(true)
                    }
                } else {
                    setShowError("Image Size Must Be Smaller Than 8MB")
                }
            } else {
                setShowError("Image Must Be Jpeg,Jpg or Png format")
            }
        }

        const handleImageUpload = (e) => {
            e.preventDefault()
            const ImgFormData = new FormData()
            ImgFormData.append("Cover-image", selectedFile)

            axiosInstance.post("upload/background/"+ user._id, ImgFormData, {
                headers: {authorization : "Bearer "+token, 'Content-Type': "multipart/form-data"}
            }).then((response) => {
                const new_user = {...user, coverPic : response.data.filename}
                localStorage.removeItem("userLocal")
                localStorage.setItem("userLocal", JSON.stringify(new_user))
            }).then(data => {
                window.location.reload(false)
            }).catch((error) => {
                console.log(error)
            })
        }

        return (
            <>
                <div className="coverBrowserCont">
                    <div className="MessageEditErr" style={ showError ? {visibility: 'visible'} : {visibility: 'hidden'}}>
                        <span className="MessageErr">{showError}</span>
                        <span className="MessageClose" onClick={() => setShowError("")}>✖</span>
                    </div>
                    <div className="coverBrowserWrap">
                        <div className="exitButtonCont" onClick={() => setCoverBrowseOpen(false)}>
                            <div className="exitButtonWrap">
                                <span>✖</span>
                            </div>
                        </div>
                        <div className="coverBrowserProps">
                            <span>Select An cover image</span>
                            <div className="coverBrowserSelectBox">
                                {!isSelected 
                                ?
                                    <>
                                        <div className="coverBrowserSelectBoxIcon">
                                            <AddPhotoAlternateIcon className="coverBrowserSelectIcon" style={{fontSize: '30px', color: 'white'}}/>
                                            <input type="file" onChange={changeHandler} accept=".jpg,.jpeg,.png" style={{opacity: 0, width: '100%', height: '100%', borderRadius: '1000px', cursor: 'pointer'}}/>
                                        </div>
                                    </>
                                :
                                    <>  
                                        <div className="coverBrowserSelectBoxIcon">
                                            <img src={URL.createObjectURL(selectedFile)} alt="" crossOrigin="anonymous" />
                                            <input type="file" onChange={changeHandler} accept=".jpg,.jpeg,.png" style={{opacity: 0, width: '100%', height: '100%', borderRadius: '1000px', cursor: 'pointer', position: 'absolute', right: '0'}}/>
                                        </div>
                                        <div className="coverBrowserSelectBoxIconButton">
                                            <button className="handleCoverUploadButton" onClick={(e) => handleImageUpload(e)}>Upload Image</button>
                                        </div>
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            {token ?
                <>
                    <PopUp />
                    {imageBrowseOpen ? <ImageBrowseComp/> : null}
                    {coverBrowseOpen ? <CoverBrowseComp/> : null}

                    <div className="settingCont">
                        <div className="settingWrap">
                            <Link to="/">
                                <div className="exitButtonCont">
                                    <div className="exitButtonWrap">
                                        <span>✖</span>
                                    </div>
                                </div>
                            </Link>
                            <div className="settingMain">
                                <div className="settingMidProf">
                                    <div className="settingMidProfWrap">
                                        <img src={PF + user.profilePic} className="settingMidProfImg" crossOrigin="anonymous" alt="" />
                                        <div className="settingMidProfTextCont" onClick={() => !imageBrowseOpen ? setImageBrowseOpen(true) : setImageBrowseOpen(false)}>
                                            <span className="settingMidProfText">Change Profile Pic</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="settingTopCover">
                                    <div className="settingTopWrap">
                                        <img src={BPF + user.coverPic} crossOrigin="anonymous" alt="" />
                                        <div className="settingTopCoverTextCont" onClick={() => !coverBrowseOpen ? setCoverBrowseOpen(true) : setCoverBrowseOpen(false)}>
                                            <span className="settingTopCoverText">Change Cover Pic</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="settingBottomSel">
                                    <div className="settingBottomSelEditConv">
                                        <div className="settingBottomEds">
                                            <div className="settingBottomTextDiv">
                                                <div className="settingBottomType">USERNAME</div>
                                                <div className="settingBottomType">{user.username}</div>
                                            </div>
                                            <button className="settingBottomEditButton" value="username" onClick={e => setButPress(e.target.value)}>Edit</button>
                                        </div>
                                        <div className="settingBottomEds">
                                            <div className="settingBottomTextDiv">
                                                <div className="settingBottomType">EMAIL</div>
                                                <div className="settingBottomType">{replaceBetween()}</div>
                                            </div>
                                            <button className="settingBottomEditButton" value="email" onClick={e => setButPress(e.target.value)}>Edit</button>
                                        </div>
                                        <div className="settingBottomEds">
                                            <div className="settingBottomTextDiv">
                                                <div className="settingBottomType">PASSWORD</div>
                                                <div className="settingBottomType">**************</div>
                                            </div>
                                            <button className="settingBottomEditButton" value="password" onClick={e => setButPress(e.target.value)}>Edit</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            : 
                <div className="settingErr">
                    <span>You shouldn't be here</span>
                </div>
            }
        </>
    )
}