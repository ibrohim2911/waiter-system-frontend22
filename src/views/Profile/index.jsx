import { useAuth } from "../../context/AuthContext";
import Waiter from "./Waiter";
import Admin from "./Admin";

const Profile = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="text-center text-zinc-300 p-10">Loading profile...</div>
    if (!user) return <div className="text-center text-zinc-300 p-10">No user data</div>
    return user?.role === "waiter" ? (<Waiter />) : (<Admin />)
}

export default Profile