// Αρχηκοποιηση και εναρξη της express εφαρμογης μας
// Οπως και ολα τα πακετα που εγκαταστησαμε
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const helmet = require('helmet')
const morgan = require('morgan')
const multer = require("multer")
var cors = require('cors')
const cookieParser = require("cookie-parser")
const userRoute = require('./routes/users')
const authRoute = require('./routes/auth')
const messageRoute = require("./routes/messages")
const convRoute = require("./routes/conversations")
const path = require("path")

// Ανοιγμα του .env αρχειου μας 
dotenv.config()

// Συνδεση στην βαση δεδομενων
mongoose.connect(process.env.MONGO_DB, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
    console.log("connected to mongo")
})

// cors
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

// Αναθετησει τον μεσολογισμικων στην express εφαρμογη
app.use(express.json())
app.use(helmet())

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      imgSrc: ['*', "'self'", 'data:', 'https:', 'blob:']
    }
  })
)
// helps control DNS prefetching and improves user privacy
app.use(
  helmet.dnsPrefetchControl({
    allow: true,
  })
)
//remove X-Powered-By
app.use(helmet.hidePoweredBy())

// sets the X-Frame-Options in the header to prevent clickjacking attacks
app.use(
  helmet.frameguard({
    action: "deny",
  })
)
//prefer https over http strict
app.use(
  helmet.hsts({
    maxAge: 123456,
    includeSubDomains: false,
  })
)
// prevents MIME type sniffing
app.use(helmet.noSniff())

//controls the information inside the Referer header
app.use(
  helmet.referrerPolicy({
    policy: ["origin", "unsafe-url"],
  })
)

// prevents cross-site scripting
app.use(helmet.xssFilter())

app.use(morgan('common'))
app.use(cookieParser())
app.use(cors())

app.use("*/images/", express.static(path.join(__dirname, "PUBLIC_FOLDER/images/")))
app.use("*/background/", express.static(path.join(__dirname, "PUBLIC_FOLDER/background/")))
app.use("*/sounds/", express.static(path.join(__dirname, "PUBLIC_FOLDER/sounds/")))

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "PUBLIC_FOLDER/images");
    },
    filename: (req, file, cb) => {
      cb(null, req.body.name);
    },
  })
  
  const upload = multer({ storage: storage });
  app.post("/api/v1/upload/image", upload.single("file"), (req, res) => {
    try {
      return res.status(200).send("File uploded successfully")
    } catch (error) {
      console.error(error);
    }
  })

  const storage_back = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "PUBLIC_FOLDER/background");
    },
    filename: (req, file, cb) => {
      cb(null, req.body.name);
    },
  })
  
  const upload_back = multer({ storage: storage_back });
  app.post("/api/v1/upload/background", upload_back.single("file"), (req, res) => {
    try {
      return res.status(200).send("File uploded successfully")
    } catch (error) {
      console.error(error);
    }
  })

app.use("/api/v1/users", userRoute)
app.use("/api/v1/auth", authRoute)
app.use("/api/v1/conversations", convRoute)
app.use("/api/v1/messages", messageRoute)

// Η port η οποια θα τρεχει ο backend server μας
const server = app.listen(process.env.PORT || 8800, () => {
    console.log("Backend Server is running")
})

const io = require("socket.io")(server, {cors: {origin: '*',}})

let users = []

// μεθοδος για την εισαγωγη των χρηστων και 
// το id του socket 
const userConnection = (userId, socketId) => {
    if (!users?.some(user=>user.userId === userId)) {
		  users?.push({userId, socketId})
	  } else {
		  users.map((ch) => {
			  return ch.userId === userId ? ch.socketId = socketId : ch
		  })
	  }
}

// μεθοδος για την αφαιρεση του χρηστη
const removeUser = (socketId) => {
    users = users.filter(user=>user.socketId !== socketId)
}

const getUser = (userId) => {
    return users.find(user=>user.userId === userId)
}

io.on("connection", (socket) =>{
  // παρε το id του χρηστη απο τον client
  socket.on("userCon", userId => {
      userConnection(userId, socket.id)
      // παρε το id του socket και στειλτο στον client
      io.emit("getUserCon", users)
  })

  // παρε το αντικειμενο senderId, receiverId, text
  // απο τον client
  socket.on("sendMsg", ({data, conversationId, initMess, read}) => {
    let user = getUser(data.receiverId)

    // στειλε σε ολους τους συνδεμενους χρηστες
    // το αντικειμενο senderId και text
    io.to(user.socketId).emit("getMsg", {
      initMess,
      conversationId,
      read,
      data,
    })
  })

  // αποσυνδεσε τον χρηστη απο τον σερβερ
  socket.on("userDisconnect", (userId) => {
    let user = getUser(userId)

    users = removeUser(user.socketId)
    io.emit("getUserCon", users)
  })

})