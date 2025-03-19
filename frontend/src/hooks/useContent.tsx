import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";

export function useContent() {
    const [contents, setContents] = useState([]);

    async function refresh() {
        try {
            const token = localStorage.getItem("token"); 
            if (!token) {
                console.error("⚠ No authentication token found! Redirecting to login.");
                return;
            }

            const response = await axios.get(`${BACKEND_URL}/api/v1/content`, {
                headers: {
                    "Authorization": `Bearer ${token}` 
                }
            });

            setContents(response.data);
        } catch (error: any) {
            if (error.response?.status === 401) {
                console.error("⚠ Unauthorized! Token might be expired or invalid. Redirecting to login...");
                alert("Session expired! Please log in again.");
                localStorage.removeItem("token"); 
                window.location.href = "/login"; 
            } else {
                console.error(" Error fetching content:", error.message);
            }
        }
    }

    useEffect(() => {
        refresh(); 

        let interval = setInterval(() => {
            refresh();
        }, 10000); 

        return () => clearInterval(interval);
    }, []);

    return { contents, refresh };
}