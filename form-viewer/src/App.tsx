import React from 'react';
import './App.css';
import Router from "./components/Router";
import AuthContextProvider from "./contexts/UserContextProvider";
import InstallModal from "./components/modals/InstallModal";

const App: React.FC = () => {

    return (
        <>
            <InstallModal />
            <AuthContextProvider>
                <Router/>
            </AuthContextProvider>
        </>


    );
};
export default App;
