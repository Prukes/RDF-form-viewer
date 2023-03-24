import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import RoutingConstants from "../constants/RoutingConstants";
import {FORMS_DB, FORMS_METADATA_STORE} from "../constants/DatabaseConstants";
import idb, {IDBPDatabase, IDBPTransaction, StoreNames} from "idb";
import {FormMetadata} from "../utils/FormsDBSchema";
import {getAllFromDB} from "../services/DBService";



const headers = {
    'Content-Type': 'application/json',
}
const Dashboard: React.FC = () => {
    const [forms, setForms] = useState<FormMetadata[]>([]);


    useEffect(() => {
        const fetchForms = async () => {
            const formsMetadata:FormMetadata[] = await getAllFromDB(FORMS_METADATA_STORE);

            console.log('yikes from dashboard')
            console.log('forms', formsMetadata);

           setForms(formsMetadata);

        };

        fetchForms();
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>
            {forms.length > 0 ? (
                <div>
                    <p>Downloaded forms:</p>
                    <ul>
                        {forms.map((form) => (
                            <li key={form.dataKey}>
                                {form.name? form.name : form.dataKey}{' '}
                                <Link to={`${RoutingConstants.FORM}/${form.dataKey}`}>Fill</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>No forms downloaded yet. Go to the <Link to={RoutingConstants.DOWNLOAD}>Download Form</Link> page to download a form.</p>
            )}
        </div>
    );
};

export default Dashboard;