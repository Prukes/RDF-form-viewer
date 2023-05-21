import React, {useContext, useState} from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import {LOGIN_URL, USER_CREDS_URL} from "../constants/ApiConstants";
import '../assets/LoginPage.css';
import {useNavigate} from "react-router-dom";
import Layout from "../components/Layout";
import {apiService} from "../utils/ApiService";
import {AuthContext} from "../contexts/UserContextProvider";
import {LoginData, LoginInputs} from "../types/Types";
import axios from "axios/index";


const LoginPage = () => {
    const { register, handleSubmit, setError, formState: {errors} } = useForm<LoginInputs>();
    const navigation = useNavigate();
    const authContext = useContext(AuthContext);
    const [loginError, setLoginError] = useState<string>('');

    const onSubmit = async (data:LoginInputs) => {
        const username = data.username;
        const password = data.password;
        setLoginError('');

        try {
            if (username && password) {
                const responseLogin = await apiService.post(LOGIN_URL, `username=${username}&password=${password}`);
                console.log(responseLogin);
                const data: LoginData = responseLogin.data;

                if (responseLogin.status == 200 && data.loggedIn){
                    await downloadUserCredentials();
                } else {
                    console.error('Oopsie', responseLogin.data);
                    setLoginError(responseLogin.data.errorMessage);
                }

            }
        } catch(error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Request made but the server responded with an error
                    if (error.response.status == 500) {
                        console.error(error);
                        setLoginError(error.response.data);
                    }
                    // Request made but the server did not respond
                } else if (error.request) {
                    setLoginError('Server was unreachable.');
                } else {
                    // Error occured while setting up the request
                }
            } else {
                console.error(error);
            }
        }


    };

    const downloadUserCredentials = async () => {
        const responseUserCreds = await apiService.get(USER_CREDS_URL);
        console.log(responseUserCreds);
        if (responseUserCreds.status !== 200){
            console.error('Oopsie', responseUserCreds.data);
            setLoginError(responseUserCreds.status +' Something went wrong during user credentials download.')
        } else {
            authContext.setAuthUser(responseUserCreds.data);
            navigation(-1);
        }
    };

    return (
        <Layout onClickBack={() => {navigation(-1)}} title={'Login'}>
            <Container className="login-container">
                <div className="login-form-container shadow p-4">
                    <h1>Login</h1>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Form.Group controlId="formBasicUsername" className="mb-3">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                {...register("username",{required:true})}
                                type="text"
                                placeholder="Enter username"
                                name="username"
                            />
                            {errors.username && <Form.Text>This field is required</Form.Text>}
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword" className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control  {...register("password",{required:true})}
                                           type="password"
                                           placeholder="Password"
                                           name="password"

                            />
                            {errors.password && <Form.Text>This field is required</Form.Text>}
                        </Form.Group>
                        {loginError && <p className={"text-wrap text-danger"}>{loginError}</p>}
                        <Button variant="primary" type="submit" >
                            Submit
                        </Button>
                    </Form>
                </div>
            </Container>
        </Layout>

    );
};

export default LoginPage;