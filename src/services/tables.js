import api from "./api";

export const getAllTables = async () => {
  const res = await api.get("/tables/");
  return res.data;
};
