import React, {useEffect, useState} from 'react';
import {Controller, useForm} from "react-hook-form";
import {apiService} from "../../utils/ApiService";
import {FORM_TEMPLATES_URL} from "../../constants/ApiConstants";
import {Button, Container, Dropdown, Form} from "react-bootstrap";
import ToastComponent from "../toasts/ToastComponent";
// @ts-ignore
import JsonLdUtils from "jsonld-utils";
import {FormDownloadInputs, FormDownloadTabProps, FormTemplate} from "../../types/Types";



const FormDownloadTab: React.FC<FormDownloadTabProps> = (props) => {
    const {control, handleSubmit} = useForm<FormDownloadInputs>();
    const [templates, setTemplates] = useState<FormTemplate[]>([]);

    const _getOptionValue = (property: any) => {
        if (property.hasOwnProperty("http://www.w3.org/2000/01/rdf-schema#label")) {
            const valueObj = property["http://www.w3.org/2000/01/rdf-schema#label"];
            console.log('valueObj ', valueObj);
            return valueObj[0]['@value'];
        } else if (property.hasOwnProperty("http://www.w3.org/2000/01/rdf-schema#comment")) {
            const valueObj = property["http://www.w3.org/2000/01/rdf-schema#comment"];
            return valueObj[0]['@value'];
        }
    }

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await apiService.get(FORM_TEMPLATES_URL, {headers: {"Content-Type": 'application/json'}});
                console.log(response);
                if (response.status == 200) {
                    setTemplates(response.data);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchOptions();
    }, []);

    const onSubmit = async (data: FormDownloadInputs) => {
        props.downloadForm(data);
        // const newRecord = createNewRecord();
        // newRecord.formTemplate = data.option['@id'];
        // newRecord.localName = data.name;
        // try{
        //     const responseFormGen = await apiService.post(FORM_GEN_URL, newRecord);
        //     console.log(responseFormGen);
        //     if (responseFormGen.status === 200) {
        //         const generatedForm: FormDataContent = responseFormGen.data;
        //         const dateCreated = Date.now();
        //         const defaultMetadata: FormMetadata = createNewMetadata(data.name, dateCreated);
        //
        //         await setInDB(FORMS_DATA_STORE, defaultMetadata.dataKey, generatedForm);
        //         await setInDB(FORMS_RECORDS_STORE, defaultMetadata.dataKey, newRecord);
        //         await setInDB(FORMS_METADATA_STORE, uuidv4() as string, defaultMetadata);
        //     } else {
        //         console.error('Oopsie', responseFormGen.data);
        //         // setError('root',responseLogin.data);
        //     }
        // } catch(e){
        //     //TODO: handle axios errors
        //     console.error(e);
        // }
        //

    };

    return (
        <>
            <ToastComponent message={'Couldn\'t download form templates!'} title={''} type={'error'}
                            show={false}></ToastComponent>
            <Container className="login-container">
                <div className="login-form-container shadow p-4">
                    <h1>Form download</h1>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Form.Group controlId="name">
                            <Form.Label>Name</Form.Label>
                            <Controller
                                name="name"
                                control={control}
                                defaultValue=""
                                rules={{required: true}}
                                render={({field, fieldState}) => (
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter form name"
                                        value={field.value}
                                        onChange={field.onChange}
                                        isInvalid={fieldState.invalid}
                                    />
                                )}
                            />
                        </Form.Group>
                        <Form.Group controlId="option" className={"my-1"}>
                            <Form.Label>Template</Form.Label>
                            <Controller
                                name="option"
                                control={control}
                                rules={{required: true}}
                                render={({field, fieldState}) => (
                                    <Dropdown>
                                        <Dropdown.Toggle className={"w-100"} variant="success" id="dropdown-basic">
                                            {field.value ? _getOptionValue(field.value) : "Select an option"}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu className={"w-100"}>
                                            {templates.map((template) => (
                                                <Dropdown.Item
                                                    key={
                                                        //ts-ignore
                                                        template['@id']
                                                    }
                                                    onClick={() => field.onChange(template)}
                                                >
                                                    {_getOptionValue(template)}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                )}
                            />
                        </Form.Group>
                        <Container className={'d-flex justify-content-center p-0'}>
                            <Button className={'mt-1 w-100'} variant="primary" type="submit">
                                Submit
                            </Button>
                        </Container>

                    </Form>
                </div>
            </Container>
        </>
    );
};


export default FormDownloadTab;