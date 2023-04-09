import React, {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {getFromDB, setInDB} from "../services/DBService";
import {FORMS_DATA_STORE, FORMS_RECORDS_STORE} from "../constants/DatabaseConstants";
import {Button, Container, Spinner} from "react-bootstrap";
import SForms from "@kbss-cvut/s-forms";
import SFormsOptions from "../utils/SFormsOptions";
import {API_URL} from "../constants/ApiConstants";
import axios from "axios";
import Layout from "../components/Layout";
import {AiFillSave} from "react-icons/all";
import SFormsRefInterface from "../utils/SFormsRefInterface";
import {FormDataContent, FormRecord, Question} from "../utils/FormsDBSchema";
import jsonld from 'jsonld';
import CONTEXT_CONSTANT from "../constants/FormContext";

const FormPage: React.FC = () => {
    const {uuid} = useParams<{ uuid: string }>();
    const [form, setForm] = useState<FormDataContent | null>(null);
    const [record, setRecord] = useState<FormRecord | null>(null);
    const navigate = useNavigate();
    const formRef = useRef<SFormsRefInterface>();

    useEffect(() => {
        const readFormFromDB = async () => {
            if (!form) {
                const formTmp = await getFromDB(FORMS_DATA_STORE, uuid as string);
                console.log(formTmp);
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
            const formData = formRefValue.getFormData();
            const formRoot = formRefValue.context.getData();
            let aaa;

            await setInDB(FORMS_RECORDS_STORE, uuid as string, {...record, question: formData});
            if(formRoot.hasOwnProperty('root')){
                // @ts-ignore
                aaa = formRoot['root'];
                console.log(aaa);
                const formQuestionsData = await jsonld.flatten(aaa, CONTEXT_CONSTANT);
                await setInDB(FORMS_DATA_STORE, uuid as string, formQuestionsData);
            }

            // console.log('FormData', formData);
            // console.log('FormQuestionData', formQuestionsData);
            // console.log(questionData);


            console.log('hopefully stored record in db');
        }
    }

    const fetchTypeAheadValues = async (query: string) => {
        let axiosBackend = axios.create({
            withCredentials: true
        });

        console.log("fetchTypeAhead", query)
        const FORM_GEN_POSSIBLE_VALUES_URL = `${API_URL}/rest/formGen/possibleValues`;
        const result = await axiosBackend.get(FORM_GEN_POSSIBLE_VALUES_URL, {params: {query: query}});
        return result.data;
    }

    if (!form) {
        return <Spinner animation="border" variant="primary"/>;
    }
    // console.log(form);
    return (
        <Layout title={"Form"} onClickBack={() => {
            navigate(-1)
        }} specialButton={<Button onClick={getFormData}><AiFillSave/></Button>}>
            <Container>
                <SForms //@ts-ignore
                    form={form}
                    ref={formRef}
                    options={SFormsOptions}
                    fetchTypeAheadValues={fetchTypeAheadValues}
                    loader={<Spinner animation={"border"}/>}
                    enableForwardSkip={true}
                ></SForms>

            </Container>
        </Layout>

    );
}

export default FormPage;