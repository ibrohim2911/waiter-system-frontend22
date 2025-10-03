import api from "./api";

export const me = async () => {
    let me = null;
    try{
        const response = await api.get("/getme/");
        me = response.data;
    } catch (error) {
        console.error("Error fetching user data:", error); 
    }
    return me;
}