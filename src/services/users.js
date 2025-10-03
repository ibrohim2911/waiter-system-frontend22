import api from "./api";

export const getAllUsers = async () => {
  const res = await api.get("/users/");
  return res.data;
};
