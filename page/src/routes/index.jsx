import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLastVisitedView } from 'misc/lastVisitedView';

export function Index() {
    const navigate = useNavigate();
    useEffect(() => {
        return navigate(`/${new Date().getFullYear()}/${getLastVisitedView()}`, { replace: true });
    }, [navigate]);
};