import App from './App'
import { React } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthContextProv } from "./context/authContext/authContext"
import { ConvContextProv } from './context/convContext/convContext'
import { MessContextProv } from './context/messContext/messContext'
import { FrienContextProv } from './context/frienContext/frienContext'

const rootElement = document.getElementById("root")
const root = createRoot(rootElement)

{/*δινουμε το context του user σε ολο το app*/}
root.render(
  <AuthContextProv>
      <FrienContextProv>
        <ConvContextProv>
          <MessContextProv>
            <App />
          </MessContextProv>
        </ConvContextProv>
      </FrienContextProv>
  </AuthContextProv>
)
