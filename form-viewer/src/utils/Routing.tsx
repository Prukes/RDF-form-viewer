import {createBrowserRouter} from "react-router-dom";
import ErrorPage from "../pages/ErrorPage";
import React from "react";
import LoginPage from "../pages/LoginPage";
import App from "../App";


const router =  createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        errorElement: <ErrorPage />,
    },
    {
        path: "/login",
        element: <LoginPage/>,
        errorElement: <ErrorPage />,
    },

]);
export default router;
