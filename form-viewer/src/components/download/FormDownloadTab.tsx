import React, {useEffect, useState} from 'react';
import {Controller, useForm} from "react-hook-form";
import {useNavigate} from "react-router-dom";
import {apiService} from "../../utils/ApiService";
import {FORM_TEMPLATES_URL, LOGIN_URL} from "../../constants/ApiConstants";
import Layout from "../Layout";
import {Button, Container, Dropdown, Form} from "react-bootstrap";
import ToastComponent from "../toasts/ToastComponent";
// @ts-ignore
import JsonLdUtils from "jsonld-utils";

type FormDownloadComponentProps = {

}

type Inputs = {
    name: string,
    option: string,
};

const FormDownloadTab:React.FC<FormDownloadComponentProps> = props => {
    const { control, handleSubmit } = useForm<Inputs>();
    const navigation = useNavigate();
    const [showErrorToast, setShowErrorToast] = useState<boolean>(false);
    const [templates, setTemplates] = useState<string[]>([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try{
                const response = await apiService.get(FORM_TEMPLATES_URL, {headers:{"Content-Type":'application/json'}});
                console.log(response);
                const options = [];
                if(response.status == 200){
                    for(const obj of response.data){
                        if(obj.hasOwnProperty("http://www.w3.org/2000/01/rdf-schema#label")){
                            const valueObj = obj["http://www.w3.org/2000/01/rdf-schema#label"];
                            options.push(valueObj['@value']);
                        } else if(obj.hasOwnProperty("http://www.w3.org/2000/01/rdf-schema#comment")) {
                            const valueObj = obj["http://www.w3.org/2000/01/rdf-schema#comment"];
                            options.push(valueObj['@value']);
                        }
                    }
                }
                setTemplates(options);
            } catch (e) {

            }

        };
        fetchOptions();
    }, []);

    const onSubmit = async (data:Inputs) => {
        const username = data.option;
        const password = data.name;
        console.log(username, password);

        if (username && password) {
            const responseLogin = await apiService.post(LOGIN_URL, `username=${username}&password=${password}`);
            console.log(responseLogin);
            if (responseLogin.status !== 200){
                console.error('Oopsie', responseLogin.data);
                // setError('root',responseLogin.data);
            }

        }

    };

    return (
        <Layout onClickBack={() => {navigation(-1)}} title={'Login'}>
            <ToastComponent message={'Couldn\'t download form templates!'} title={''} type={'error'} show={false}></ToastComponent>
            <Container className="login-container">
                <div className="login-form-container shadow p-4">
                    <h1>Login</h1>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Form.Group controlId="name">
                            <Form.Label>Name</Form.Label>
                            <Controller
                                name="name"
                                control={control}
                                defaultValue=""
                                rules={{ required: true }}
                                render={({ field, fieldState }) => (
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your name"
                                        value={field.value}
                                        onChange={field.onChange}
                                        isInvalid={fieldState.invalid}
                                    />
                                )}
                            />
                        </Form.Group>
                        <Form.Group controlId="option">
                            <Form.Label>Option</Form.Label>
                            <Controller
                                name="option"
                                control={control}
                                defaultValue=""
                                rules={{ required: true }}
                                render={({ field, fieldState }) => (
                                    <Dropdown>
                                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                                            {field.value ? field.value : "Select an option"}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {templates.map((template) => (
                                                <Dropdown.Item
                                                    key={template}
                                                    onClick={() => field.onChange(template)}
                                                >
                                                    {template}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                )}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </div>
            </Container>
        </Layout>

    );
};


export default FormDownloadTab;