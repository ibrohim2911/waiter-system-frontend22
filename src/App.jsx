import { Login } from "./views"

function App() {

  const { token } = useAuth()

  return (
    <div className="container w-screen h-screen">
      {!token ? <Login /> : <Logout />}
      <h1 className="text-white">Welcome to the Waiter System</h1>
    </div>
  )
}

export default App
