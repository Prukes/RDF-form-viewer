import React from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import {API_URL} from "../constants/ApiConstants";
import axios from "axios";
import '../assets/LoginPage.css';


type Inputs = {
    username: string,
    password: string,
};
const LoginPage = () => {
    const { register, handleSubmit,setError, formState: {errors} } = useForm<Inputs>();

    const onSubmit = async (data:Inputs) => {
        let resp = await fetch(`${API_URL}/j_spring_security_check`,{method:'POST',body:`username=ahoj&password=ahoj`,headers:{"Content-Type":'application/x-www-form-urlencoded'}});
        console.log(resp);
        let axiosCreds = axios.create({
            withCredentials: true
        });
        const username = data.username;
        const password = data.password;
        console.log(username, password);
        if (username && password) {
            const response = await axiosCreds.post(`${API_URL}/j_spring_security_check`, `username=${username}&password=${password}`);

        }
    };

    return (
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
    );
};

export default LoginPage;