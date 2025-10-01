
import { useAuth } from "./context/AuthContext"
import { Login, Orders } from "./views"
import { BottomBar } from "./components"
import { Routes, Route } from "react-router-dom"

function App() {

  const { token } = useAuth()

  return (
    <div className="">
      {!token ? <Login /> :
        (
          <>
            <Routes>
              <Route path="/" element={<Orders />} />
              <Route path="/create-order" element={<h1>Create Order</h1>} />
            </Routes>
            <BottomBar />
          </>
        )
      }
    </div>
  )
}

export default App
