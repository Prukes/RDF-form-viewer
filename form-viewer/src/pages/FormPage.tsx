import React, {useEffect, useRef, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {getFromDB, setInDB} from "../services/DBService";
import {
    FORMS_DATA_STORE,
    FORMS_FILES_STORE,
    FORMS_METADATA_STORE,
    FORMS_RECORDS_STORE
} from "../constants/DatabaseConstants";
import {Button, Container, Spinner} from "react-bootstrap";
import SFormsOptions from "../utils/SFormsOptions";
import {API_URL} from "../constants/ApiConstants";
import Layout from "../components/Layout";
import {AiFillSave} from "react-icons/all";
import SFormsRefInterface from "../utils/SFormsRefInterface";
import {FormDataContent, FormFile, FormMetadata, FormRecord, Question} from "../utils/FormsDBSchema";
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
    const [files, setFiles] = useState<FormFile[]>([]);
    const [toastState, setToastState] = useState<ToastData>({
        toastMessageTitle: '',
        showToast: false,
        type: 'error',
        toastMessage: ''
    });
    const navigate = useNavigate();
    const {state} = useLocation();
    const [metadata, setMetadata] = useState<FormMetadata | null>(state);
    const formRef = useRef<SFormsRefInterface>();

    useEffect(() => {
        const readFormFromDB = async () => {
            if(!metadata){
                const formMetadata = await getFromDB(FORMS_METADATA_STORE, uuid as string);
                setMetadata(formMetadata);
            }
            if (!form) {
                const formTmp = await getFromDB(FORMS_DATA_STORE, metadata?.dataKey as string);
                setForm(formTmp);
            }
            if (!record) {
                const rec = await getFromDB(FORMS_RECORDS_STORE, metadata?.dataKey as string);
                setRecord(rec);
            }
            if(!files.length){
                const formFiles = await getFromDB(FORMS_FILES_STORE, metadata?.dataKey as string);
                if(formFiles){
                    setFiles(formFiles);
                    console.log(formFiles);
                }
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
            const updatedMetadata = {...metadata, wasUpdated: true};

            await setInDB(FORMS_RECORDS_STORE, metadata?.dataKey as string, recordUpdate);
            await setInDB(FORMS_METADATA_STORE, uuid as string, updatedMetadata)

            if (formRoot.hasOwnProperty('root')) {
                // @ts-ignore
                const graph = formRoot['root'];
                const formQuestionsData = await jsonld.flatten(graph, CONTEXT_CONSTANT);
                await setInDB(FORMS_DATA_STORE, metadata?.dataKey as string, formQuestionsData);
                await setInDB(FORMS_FILES_STORE, metadata?.dataKey as string, files);
            }

            setToastState((prev) => {return {
                ...prev,
                type:'success',
                toastMessage:'Changes have been saved!',
                showToast:true,
                toastMessageTitle:'Stored'
            }});
            console.log('hopefully stored record in db');
        }
    }

    const fetchTypeAheadValues = async (query: string) => {

        console.log("fetchTypeAhead", query)
        const FORM_GEN_POSSIBLE_VALUES_URL = `${API_URL}/rest/formGen/possibleValues`;
        const result = await apiService.get(FORM_GEN_POSSIBLE_VALUES_URL, {params: {query: query}});
        return result.data;
    }

    const onFileUpload = async (file: FormFile, prevFileID?: string) => {
        let filesTMP:FormFile[] = [...files];
        if(prevFileID){
            filesTMP = filesTMP.filter((f) => f.id !== prevFileID);
        }

        filesTMP.push(file);
        setFiles(filesTMP);
    };

    const onGetFile = async (questionAnswer: any) => {
        if (questionAnswer && questionAnswer[0]) {
            const answer = questionAnswer[0];
            const fileObjectValue = answer[Constants.HAS_OBJECT_VALUE];
            if (!fileObjectValue) return null;

            const fileID = fileObjectValue['@id'];
            console.log(`Looking for file: ${fileID}`);
            const files: FormFile[] = await getFromDB(FORMS_FILES_STORE, metadata?.dataKey as string);
            const file = files.find((f) => f.id === fileID);
            console.log(`found ${file}`);
            if (file) {
                return file;
            }
        }
    };

    const onFileDelete = async (file: FormFile) => {
        // const files: FormFile[] = await getFromDB(FORMS_FILES_STORE, metadata?.dataKey as string);
        const filteredFiles: FormFile[] = files.filter((f) => f.id !== file.id);
        // await setInDB(FORMS_FILES_STORE, metadata?.dataKey as string, [...filteredFiles]);
    };

    if (!form) {
        return <Spinner animation="border" variant="primary"/>;
    }
    // console.log(form);
    // const componentMapping = GeoComponents.getComponentMapping();

    return (
        <Layout title={"Form"} onClickBack={() => {
            navigate(-1)
        }} specialButton={<Button onClick={getFormData}><AiFillSave/></Button>}>
            <ToastComponent position={'bottom-center'} delay={4000} message={toastState.toastMessage} title={toastState.toastMessageTitle}
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
                    // componentMapRules={componentMapping}
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