import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {Button, Form} from "react-bootstrap";
import Layout from "../components/Layout";
import {v4 as uuidv4} from "uuid";
import {FormMetadata, FormRecord} from "../utils/FormsDBSchema";
import Priority from "../utils/PriorityEnum";
import {setInDB} from "../services/DBService";
import {FORMS_DATA_STORE, FORMS_METADATA_STORE, FORMS_RECORDS_STORE} from "../constants/DatabaseConstants";
import ToastComponent from "../components/toasts/ToastComponent";
import {useNavigate} from "react-router-dom";

type FormData = {
    name: string;
    template: string;
    file: FileList;
};

const ImportPage: React.FC = () => {
    const {register, handleSubmit, formState: {errors}} = useForm<FormData>();
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
    const navigation = useNavigate();

    const onSubmit = (data: FormData) => {
        const file = data.file[0];
        const reader = new FileReader();

        reader.onload = async (event) => {
            const fileData = event.target?.result as string;
            try {
                const fileDataParsed = JSON.parse(fileData);
                await handleSaveToIndexedDB(fileDataParsed, data);
                setErrorMessage("");
                setShowSuccessToast(true);
            } catch (error) {
                setErrorMessage("Error parsing JSON file.");
            }
        };

        reader.readAsText(file);
    };

    const handleSaveToIndexedDB = async (jsonData: string, data: FormData) => {
        try {
            const dateCreated = Date.now()
            const formDataKey = uuidv4();
            const formMetadata: FormMetadata = {
                dataKey: formDataKey,
                wasUpdated: false,
                downloadDate: dateCreated,
                priority: Priority.MEDIUM,
                name: data.name
            };
            const formRecord: FormRecord = {
                localName: data.name,
                dateCreated: dateCreated,
            };
            await setInDB(FORMS_DATA_STORE, formDataKey, jsonData);
            await setInDB(FORMS_METADATA_STORE, uuidv4(), formMetadata);
            await setInDB(FORMS_RECORDS_STORE, formDataKey, formRecord);

        } catch (e: any) {
            setErrorMessage(e);
            setShowSuccessToast(false);
        }
    };


    return (
        <Layout title={'Import page'} onClickBack={() => navigation(-1)}>
            <ToastComponent message={'Great success'} title={'Success'} type={'Success'} show={showSuccessToast}
                            position={'bottom-center'} delay={2000} onHide={() => {
                setShowSuccessToast(false)
            }}></ToastComponent>
                <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group>
                <Form.Label>Name:</Form.Label>
                <Form.Control {...register("name", {required: true})} />
            {errors.name && <Form.Text>This field is required</Form.Text>}
                </Form.Group>

                <Form.Group>
                <Form.Label>Template:</Form.Label>
                <Form.Control {...register("template", {required: true})} />
            {errors.template && <Form.Text>This field is required</Form.Text>}
                </Form.Group>

                <Form.Group>
                <Form.Label>File:</Form.Label>
                <Form.Control
                type="file"
                accept=".json"
            {...register("file", {required: true})}
                />
            {errors.file && <Form.Text>This field is required</Form.Text>}
                </Form.Group>

                <Button variant="primary" type="submit" className={'mt-2'}>
                Import
                </Button>
                </Form>
                </Layout>

                );
            };

            export default ImportPage;