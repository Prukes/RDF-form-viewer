import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {getFromDB} from "../services/DBService";
import {FORMS_DATA_STORE} from "../constants/DatabaseConstants";
import {Container, Spinner} from "react-bootstrap";
import SForms from "@kbss-cvut/s-forms";


const FormPage:React.FC = () => {
    const { uuid } = useParams<{ uuid: string }>();
    const [form, setForm] = useState(null);

    useEffect( () =>{
        const readFormFromDB = async () => {
            if(!form){
                const form = await getFromDB(FORMS_DATA_STORE,uuid as string);
                setForm(form);
            }
        };

        readFormFromDB();
    },[]);

    if(!form){
        return <Spinner animation="border" variant="primary" />;
    }
    console.log(form);
    return (
        <SForms></SForms>
    );
    // return <p>{JSON.stringify(form)}</p>
}

export default FormPage;