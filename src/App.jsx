
import { useAuth } from "./context/AuthContext"
import { Login, Orders, PlaceSelection } from "./views"
import { BottomBar } from "./components"
import { Routes, Route } from "react-router-dom"

function App() {

  const { token } = useAuth()

  return (
    <div className="min-h-screen bg-zinc-900">
      {!token ? <Login /> :
        (
          <>
            <Routes>
              <Route path="/" element={<Orders />} />
              <Route path="/create-order" element={<PlaceSelection />} />
            </Routes>
            <BottomBar />
          </>
        )
      }
    </div>
  )
}

export default App
