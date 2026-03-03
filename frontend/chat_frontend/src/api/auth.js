import api from './axios';

export const login = async (email, password) => {
  const loginData = {
    email : email,
    password : password,
  };

  const res = await api.post("/login", loginData);
  return res.data;
};