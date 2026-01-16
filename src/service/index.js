import { handleAuthError } from "@/utils/authUtils";
import axios from "axios";

export const BASE_URL =
    import.meta.env.VITE_BASE_URL || "https://paymentapi.ph.town/";

// ===== Axios interceptors =====
axios.interceptors.request.use(
    (config) => {
        if (config.url && config.url.includes("avtozapchast.netlify.app")) {
            console.warn(
                "Blocked request to avtozapchast.netlify.app:",
                config.url
            );
            return Promise.reject(
                new Error("Request blocked: avtozapchast.netlify.app")
            );
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (handleAuthError(error)) {
            return Promise.resolve({ data: { handled: true } });
        }
        return Promise.reject(error);
    }
);

// ===== Helpers =====
const getToken = () => localStorage.getItem("token");
export const Role = localStorage.getItem("role");

const withAuthHeaders = (headers = {}) => {
    const token = getToken();
    if (!token) return headers;

    return {
        Authorization: `Bearer ${token}`,
        ...headers,
    };
};

// ===== POST =====
export const PostData = async (url, data) => {
    return await axios.post(BASE_URL + url, data);
};

export const PostDataToken = async (url, data) => {
    return await axios.post(BASE_URL + url, data, {
        headers: {
            "Content-Type": "multipart/form-data",
            ...withAuthHeaders(),
        },
    });
};

export const PostDataTokenJson = async (url, data) => {
    return await axios.post(BASE_URL + url, data, {
        headers: {
            ...withAuthHeaders(),
        },
    });
};

export const PostSimple = async (url, data = {}) => {
    return await axios.post(BASE_URL + url, data, {
        headers: {
            ...withAuthHeaders(),
        },
    });
};

// ===== GET =====
export const GetDataSimple = async (url) => {
    const headers = withAuthHeaders();
    const response = await axios.get(BASE_URL + url, { headers });
    return response.data;
};

// ===== DELETE =====
export const DeleteData = async (url) => {
    return await axios.delete(BASE_URL + url, {
        headers: {
            ...withAuthHeaders(),
        },
    });
};
