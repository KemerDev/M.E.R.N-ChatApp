import App from './App'
import { React } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthContextProv } from "./context/authContext/authContext"
import { ConvContextProv } from './context/convContext/convContext'
import { FriendContextProv } from './context/friendsContext/friendContext'
import { MessContextProv } from './context/messContext/messContext'
import { PhotoContextProv } from './context/photosContext/photosContext'
import { UserContextProv } from './context/userContext/userContext'

const rootElement = document.getElementById("root")
const root = createRoot(rootElement)

{/*δινουμε το context του user σε ολο το app*/}
root.render(
  <AuthContextProv>
    <UserContextProv>
      <ConvContextProv>
        <FriendContextProv>
          <MessContextProv>
            <PhotoContextProv>
              <App />
            </PhotoContextProv>
          </MessContextProv>
        </FriendContextProv>
      </ConvContextProv>
    </UserContextProv>
  </AuthContextProv>
)
