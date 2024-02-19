import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function Year() {
    const {year} = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        return navigate('/' + year + '/calendar');
    }, [year]);
}