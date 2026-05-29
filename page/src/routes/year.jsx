import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLastVisitedView } from 'misc/lastVisitedView';

export function Year() {
    const {year} = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        return navigate(`/${year}/${getLastVisitedView()}`, { replace: true });
    }, [year, navigate]);
}