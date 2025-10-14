
import { useAuth } from "./context/AuthContext"
import { Login, Orders, PlaceSelection, OrderDetails, Profile } from "./views"
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
              <Route path="/order-details" element={<OrderDetails />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
            <BottomBar />
          </>
        )
      }
    </div>
  )
}

export default App
