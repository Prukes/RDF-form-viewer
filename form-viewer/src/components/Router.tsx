import React from "react";
import {BrowserRouter, Route, Routes as RouterRoutes} from "react-router-dom";
// import {getEnvVariable} from "../utils/Environment";
import ErrorPage from "../pages/ErrorPage";
import DashboardPage from "../pages/DashboardPage";
import RoutingConstants from "../constants/RoutingConstants";
import LoginPage from "../pages/LoginPage";
import DownloadPage from "../pages/DownloadPage";
import FormPage from "../pages/FormPage";
import EditForm from "./EditForm";


const Router: React.FC = () => {
    return (
        <BrowserRouter >
            <RouterRoutes>
                <Route path={RoutingConstants.DEFAULT} element={<DashboardPage />} />
                <Route path={RoutingConstants.DASHBOARD} element={<DashboardPage />} />
                <Route path={RoutingConstants.LOGIN} element={<LoginPage />} />
                <Route path={RoutingConstants.DOWNLOAD} element={<DownloadPage />} />
                <Route path={`${RoutingConstants.FORM}/:uuid`} element={<FormPage />} />
                <Route path={RoutingConstants.EDIT_FORM} element={<EditForm/>}/>
                <Route path="*" element={<ErrorPage />} />
            </RouterRoutes>
        </BrowserRouter>
    );
};

export default Router;