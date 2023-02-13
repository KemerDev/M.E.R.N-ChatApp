import App from './App'
import { React, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthContextProv } from "./context/authContext/authContext"
import { ConvContextProv } from './context/convContext/convContext'
import { MessContextProv } from './context/messContext/messContext'
import { FrienContextProv } from './context/frienContext/frienContext'
import { CallContextProv } from './context/callContext/CallContext'

const rootElement = document.getElementById("root")
const root = createRoot(rootElement)

{/*δινουμε το context του user σε ολο το app*/}
root.render(
  <StrictMode>
    <AuthContextProv>
        <FrienContextProv>
          <ConvContextProv>
            <CallContextProv>
              <MessContextProv>
                <App />
              </MessContextProv>
            </CallContextProv>
          </ConvContextProv>
        </FrienContextProv>
    </AuthContextProv>
  </StrictMode>
)
