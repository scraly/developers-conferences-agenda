import { createContext } from "react";

export const FilterContext = createContext({
	searchParams: {},
	open: false
});