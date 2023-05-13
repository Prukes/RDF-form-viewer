import React, {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {getFromDB, setInDB} from "../services/DBService";
import {FORMS_DATA_STORE, FORMS_FILES_STORE, FORMS_RECORDS_STORE} from "../constants/DatabaseConstants";
import {Button, Container, Spinner} from "react-bootstrap";
import SFormsOptions from "../utils/SFormsOptions";
import {API_URL} from "../constants/ApiConstants";
import Layout from "../components/Layout";
import {AiFillSave} from "react-icons/all";
import SFormsRefInterface from "../utils/SFormsRefInterface";
import {FormDataContent, FormFile, FormRecord, Question} from "../utils/FormsDBSchema";
import jsonld from 'jsonld';
import CONTEXT_CONSTANT from "../constants/FormContext";

import SForms, {Constants} from "@kbss-cvut/s-forms";
import {apiService} from "../utils/ApiService";
import {answerUriWorkaround} from "../utils/Utils";
import ToastComponent from "../components/toasts/ToastComponent";
import {ToastData} from "../types/Types";
// import GeoComponents from "s-forms-geo-components";


const FormPage: React.FC = () => {
    const {uuid} = useParams<{ uuid: string }>();
    const [form, setForm] = useState<FormDataContent | null>(null);
    const [record, setRecord] = useState<FormRecord | null>(null);
    const [toastState, setToastState] = useState<ToastData>({
        toastMessageTitle: '',
        showToast: false,
        type: 'error',
        toastMessage: ''
    });
    const navigate = useNavigate();
    const formRef = useRef<SFormsRefInterface>();

    useEffect(() => {
        const readFormFromDB = async () => {
            if (!form) {
                const formTmp = await getFromDB(FORMS_DATA_STORE, uuid as string);
                setForm(formTmp);
            }
            if (!record) {
                const rec = await getFromDB(FORMS_RECORDS_STORE, uuid as string);
                setRecord(rec);
            }
        };

        readFormFromDB();
    }, []);

    const getFormData: React.MouseEventHandler<HTMLButtonElement> = async (e: React.MouseEvent<HTMLButtonElement>) => {
        const formRefValue = formRef.current;
        if (formRefValue) {
            console.log(formRef);
            const formData: Question = formRefValue.getFormData();
            // server returns HTTP400 when answer.uri is of blank node identifier
            answerUriWorkaround(formData);

            const formRoot = formRefValue.context.getData();
            const recordUpdate = {...record, question: formData};

            await setInDB(FORMS_RECORDS_STORE, uuid as string, recordUpdate);

            if (formRoot.hasOwnProperty('root')) {
                // @ts-ignore
                const graph = formRoot['root'];
                const formQuestionsData = await jsonld.flatten(graph, CONTEXT_CONSTANT);
                await setInDB(FORMS_DATA_STORE, uuid as string, formQuestionsData);
            }

            // console.log('FormData', formData);
            // console.log('FormQuestionData', formQuestionsData);

            console.log('hopefully stored record in db');
        }
    }

    const fetchTypeAheadValues = async (query: string) => {

        console.log("fetchTypeAhead", query)
        const FORM_GEN_POSSIBLE_VALUES_URL = `${API_URL}/rest/formGen/possibleValues`;
        const result = await apiService.get(FORM_GEN_POSSIBLE_VALUES_URL, {params: {query: query}});
        return result.data;
    }

    const onFileUpload = async (file: FormFile) => {
        console.log(file);
        const files: FormFile[] = await getFromDB(FORMS_FILES_STORE, uuid as string);
        if (files == undefined) {
            await setInDB(FORMS_FILES_STORE, uuid as string, [file]);
        } else {
            await setInDB(FORMS_FILES_STORE, uuid as string, [...files, file]);
        }


    };

    const onGetFile = async (questionAnswer: any) => {
        if (questionAnswer && questionAnswer[0]) {
            const answer = questionAnswer[0];
            const fileObjectValue = answer[Constants.HAS_OBJECT_VALUE];
            if (!fileObjectValue) return null;

            const fileID = fileObjectValue['@id'];
            console.log(fileID);
            const files: FormFile[] = await getFromDB(FORMS_FILES_STORE, uuid as string);
            const file = files.find((f) => f.id === fileID);
            console.log(file);
            if (file) {
                return file;
            }
        }
    };

    const onFileDelete = async (file: FormFile) => {
        const files: FormFile[] = await getFromDB(FORMS_FILES_STORE, uuid as string);
        const filteredFiles: FormFile[] = files.filter((f) => f.id !== file.id);
        await setInDB(FORMS_FILES_STORE, uuid as string, [...filteredFiles]);
    };

    if (!form) {
        return <Spinner animation="border" variant="primary"/>;
    }
    // console.log(form);
    return (
        <Layout title={"Form"} onClickBack={() => {
            navigate(-1)
        }} specialButton={<Button onClick={getFormData}><AiFillSave/></Button>}>
            <ToastComponent delay={3000} message={toastState.toastMessage} title={toastState.toastMessageTitle}
                            type={toastState.type} show={toastState.showToast} onHide={() => {
                setToastState((prev) => {
                    return {...prev, showToast: false}
                })
            }}></ToastComponent>
            <Container>
                <SForms //@ts-ignore
                    form={form}
                    //@ts-ignore
                    ref={formRef}
                    //@ts-ignore
                    options={SFormsOptions}
                    fetchTypeAheadValues={fetchTypeAheadValues}
                    // mappingRule={GeoComponents.mappingRule}
                    //@ts-ignore
                    loader={<Spinner animation={"border"}/>}
                    enableForwardSkip={true}
                    getFile={onGetFile}
                    onFileUpload={onFileUpload}
                    onFileDelete={onFileDelete}
                ></SForms>

            </Container>
        </Layout>

    );
}

export default FormPage;