import App from './App'
import { React } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthContextProv } from "./context/authContext/authContext"
import { ConvContextProv } from './context/convContext/convContext'
import { MessContextProv } from './context/messContext/messContext'
import { UserContextProv } from './context/userContext/userContext'

const rootElement = document.getElementById("root")
const root = createRoot(rootElement)

{/*δινουμε το context του user σε ολο το app*/}
root.render(
  <AuthContextProv>
    <UserContextProv>
      <ConvContextProv>
        <MessContextProv>
          <App />
        </MessContextProv>
      </ConvContextProv>
    </UserContextProv>
  </AuthContextProv>
)
