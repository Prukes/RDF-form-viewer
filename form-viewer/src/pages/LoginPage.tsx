import React from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import {API_URL, LOGIN_URL, USER_CREDS_URL} from "../constants/ApiConstants";
import axios from "axios";
import '../assets/LoginPage.css';
import {useNavigate} from "react-router-dom";
import Layout from "../components/Layout";

type Inputs = {
    username: string,
    password: string,
};
const LoginPage = () => {
    const { register, handleSubmit, setError, formState: {errors} } = useForm<Inputs>();
    const navigation = useNavigate();

    const onSubmit = async (data:Inputs) => {
        let axiosCreds = axios.create({
            withCredentials: true
        });
        const username = data.username;
        const password = data.password;
        // console.log(username, password);
        if (username && password) {
            const responseLogin = await axiosCreds.post(LOGIN_URL, `username=${username}&password=${password}`);
            console.log(responseLogin);
            if (responseLogin.status !== 200){
                console.error('Oopsie', responseLogin.data);
                setError('root',responseLogin.data);
            }
            const responseUserCreds = await axiosCreds.get(USER_CREDS_URL);
            if (responseUserCreds.status !== 200){
                console.error('Oopsie', responseUserCreds.data);
                setError('root',responseUserCreds.data);
            }
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