import React, {useContext} from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import {LOGIN_URL, USER_CREDS_URL} from "../constants/ApiConstants";
import '../assets/LoginPage.css';
import {useNavigate} from "react-router-dom";
import Layout from "../components/Layout";
import {apiService} from "../utils/ApiService";
import {AuthContext} from "../contexts/UserContextProvider";
import {LoginData, LoginInputs} from "../types/Types";


const LoginPage = () => {
    const { register, handleSubmit, setError, formState: {errors} } = useForm<LoginInputs>();
    const navigation = useNavigate();
    const authContext = useContext(AuthContext);

    const onSubmit = async (data:LoginInputs) => {
        const username = data.username;
        const password = data.password;
        console.log(username, password);

        if (username && password) {
            const responseLogin = await apiService.post(LOGIN_URL, `username=${username}&password=${password}`);
            console.log(responseLogin);
            const data: LoginData = responseLogin.data;

            if (responseLogin.status !== 200 && !data.loggedIn){

                console.error('Oopsie', responseLogin.data);
                setError('root',responseLogin.data);
            }
            await downloadUserCredentials();
        }

    };

    const downloadUserCredentials = async () => {
        const responseUserCreds = await apiService.get(USER_CREDS_URL);
        console.log(responseUserCreds);
        if (responseUserCreds.status !== 200){
            console.error('Oopsie', responseUserCreds.data);
            setError('root',responseUserCreds.data);
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
                            {errors.username && <span>This field is required</span>}
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword" className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control  {...register("password",{required:true})}
                                           type="password"
                                           placeholder="Password"
                                           name="password"

                            />
                            {errors.password && <span>This field is required</span>}
                        </Form.Group>

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