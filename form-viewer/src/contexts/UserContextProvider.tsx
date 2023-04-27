import React, {createContext, ReactNode, useMemo, useState} from 'react';
import {Author} from "../utils/FormsDBSchema";
interface AuthContextType {
    authUser: Author | null;
    setAuthUser: (user: Author | null) => void;
}
export const AuthContext = createContext<AuthContextType>({
    authUser: null,
    setAuthUser: () => {},
});

type AuthContextProviderProps ={
    children: ReactNode
}
const AuthContextProvider: React.FC<AuthContextProviderProps> = (props) => {
    const [authUser, setAuthUser] = useState<Author | null>(null);

    const value = useMemo(() => ({
        authUser, setAuthUser
    }), [authUser]);

    return (
        <AuthContext.Provider value={value}>
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;