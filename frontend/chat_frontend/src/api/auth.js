import api from './axios';

export const login = async (email,password) => {
    const res = await api.post("/login", {
        username : email,
        password : password,
    });

    return res.data;
}