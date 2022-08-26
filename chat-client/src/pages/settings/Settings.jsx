import React,{ useContext, useState, useEffect } from "react"
import { Link } from 'react-router-dom'
import { axiosInstance} from "../../config"
import { AuthContext } from "../../context/authContext/authContext"
import { UserContext } from "../../context/userContext/userContext"
import './settings.css'

export default function Settings() {

    const {token} = useContext(AuthContext)
    const {user, userDispatch} = useContext(UserContext)

    const [butPress, setButPress] = useState("")

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

    return (
        <>
            {token ?
                <>
                    <PopUp />
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
                                    <img src={PF + user.profilePic} crossOrigin="anonymous" alt="" />
                                </div>
                                <div className="settingTopCover">
                                    <img src={BPF + user.coverPic} crossOrigin="anonymous" alt="" />
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