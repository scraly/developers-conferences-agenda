import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Index() {
    const navigate = useNavigate();
    useEffect(() => {
        return navigate('/' + new Date().getFullYear());
    }, []);
};