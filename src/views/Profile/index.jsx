import { useEffect, useState } from "react"
import { me } from "../../services/getMe";
import Waiter from "./Waiter";
import Admin from "./Admin";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        setLoading(true);
        me().then(data => {
            setUser(data);
            setLoading(false);
        });
    }, [])
    if (loading) return <div className="text-center text-zinc-300 p-10">Loading profile...</div>
    if (!user) return <div className="text-center text-zinc-300 p-10">No user data</div>
    return user?.role === "waiter" ? (<Waiter />) : (<Admin />)
}

export default Profile