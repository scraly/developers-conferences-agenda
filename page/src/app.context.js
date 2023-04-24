import {createContext, useContext} from 'react';

const CustomContext = createContext();

export const useCustomContext = () => useContext(CustomContext);

export default CustomContext;
