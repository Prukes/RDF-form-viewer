import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {Button, Form} from "react-bootstrap";
import Layout from "../components/Layout";
import {v4 as uuidv4} from "uuid";
import {FormMetadata, FormRecord} from "../utils/FormsDBSchema";
import {setInDB} from "../services/DBService";
import {FORMS_DATA_STORE, FORMS_METADATA_STORE, FORMS_RECORDS_STORE} from "../constants/DatabaseConstants";
import ToastComponent from "../components/toasts/ToastComponent";
import {useNavigate} from "react-router-dom";
import {checkData, createNewMetadata, createNewRecord, renameEdges} from "../utils/Utils";
import jsonld from "jsonld";
import CONTEXT_CONSTANT from "../constants/FormContext";
import {ImportFormData} from '../types/Types';


const ImportPage: React.FC = () => {
    const {register, handleSubmit, formState: {errors}, reset} = useForm<ImportFormData>();
    const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
    const navigation = useNavigate();

    const onSubmit = (data: ImportFormData) => {
        const file = data.file[0];
        const reader = new FileReader();

        reader.onload = async (event) => {
            const fileData = event.target?.result as string;
            try {
                const fileDataParsed = JSON.parse(fileData);
                await handleSaveToIndexedDB(fileDataParsed, data);
                setShowSuccessToast(true);
                reset();
            } catch (error) {
            }
        };

        reader.readAsText(file);
    };

    const handleSaveToIndexedDB = async (jsonData: Object, data: ImportFormData) => {
        try {
            const dateCreated = Date.now()
            const formMetadata: FormMetadata = createNewMetadata(data.name, dateCreated);
            const formRecord: FormRecord = createNewRecord();
            formRecord.localName = data.name;
            formRecord.formTemplate = data.template;
            console.log(jsonData);
            const flattenedData = await jsonld.flatten(jsonData, CONTEXT_CONSTANT);
            const nameMap = {};
            checkData(flattenedData, nameMap);
            renameEdges(flattenedData, nameMap);
            console.log(flattenedData);

            await setInDB(FORMS_METADATA_STORE, uuidv4(), formMetadata);
            await setInDB(FORMS_RECORDS_STORE, formMetadata.dataKey, formRecord);
            await setInDB(FORMS_DATA_STORE, formMetadata.dataKey, flattenedData);

        } catch (e: any) {
            setShowSuccessToast(false);
        }
    };


    return (
        <Layout title={'Import page'} onClickBack={() => navigation(-1)}>
            <ToastComponent message={'Form was successfully imported!'} title={'Success'} type={'Success'}
                            show={showSuccessToast}
                            position={'bottom-center'} delay={4000} onHide={() => {
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