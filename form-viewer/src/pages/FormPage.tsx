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
import {FormDataContent, FormRecord} from "../utils/FormsDBSchema";
import jsonld from 'jsonld';

const FormPage:React.FC = () => {
    const { uuid } = useParams<{ uuid: string }>();
    const [form, setForm] = useState<FormDataContent | null>(null);
    const [record, setRecord] = useState<FormRecord | null>();
    const navigate = useNavigate();
    const formRef = useRef<SFormsRefInterface>();

    useEffect( () =>{
        const readFormFromDB = async () => {
            if(!form){
                const form = await getFromDB(FORMS_DATA_STORE,uuid as string);
                console.log(form);
                setForm(form);
            }
            if(!record){
                const rec = await getFromDB(FORMS_RECORDS_STORE,uuid as string);
                setRecord(rec);
            }
        };

        readFormFromDB();
    },[]);

    const getFormData: React.MouseEventHandler<HTMLButtonElement> = async (e: React.MouseEvent<HTMLButtonElement>) => {
        const formRefValue = formRef.current;
        if(formRefValue){
            const formData = formRefValue.getFormData();
            const formQuestionsData = formRefValue.getFormQuestionsData();
            console.log(formData);
            console.log(formQuestionsData);
            await setInDB(FORMS_RECORDS_STORE,uuid as string,{...record,question:formData});
            console.log('hopefully stored record in db');
        }
    }

    const fetchTypeAheadValues = async (query:string) => {
        let axiosBackend = axios.create({
            withCredentials: true
        });

        console.log("fetchTypeAhead", query)
        const FORM_GEN_POSSIBLE_VALUES_URL = `${API_URL}/rest/formGen/possibleValues`;
        const result = await axiosBackend.get(`${FORM_GEN_POSSIBLE_VALUES_URL}?query=${encodeURIComponent(query)}`);
        return result.data;
    }

    if(!form){
        return <Spinner animation="border" variant="primary" />;
    }
    console.log(form);
    return (
        <Layout title={"Form"} onClickBack={() => {navigate(-1)}} specialButton={<Button onClick={getFormData}><AiFillSave/></Button>}>
            <Container fluid>
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