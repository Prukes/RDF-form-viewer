import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import axios from "axios";
import {API_URL} from "../constants/ApiConstants";
import {v4 as uuidv4} from 'uuid';
import {FORMS_DATA_STORE, FORMS_DB, FORMS_METADATA_STORE} from "../constants/DatabaseConstants";
import {setInDB} from "../services/DBService";
import {FormMetadata} from "../utils/FormsDBSchema";


const headers = {
    'Content-Type': 'application/json',
}

let forms: FormMetadata[] = [
    {dataKey: 'aaaa', name: 'super čuper'},
    {dataKey: 'bv', name: 'další random form'}
];

const DownloadPage: React.FC = () => {
    const [selectedForm, setSelectedForm] = useState<FormMetadata | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const navigation = useNavigate();

    const handleDownloadClick = async (form: FormMetadata) => {
        setSelectedForm(form);
        setIsDownloading(true);
        let axiosCreds = axios.create({
            withCredentials: true
        });
        const response = await axiosCreds.post(
            `${API_URL}/rest/formGen`,
            JSON.stringify({
                "localName": "HOVNO",
                "formTemplate": "",
                "complete": false,
                "isNew": true,
                "state": {"state": 1}
            }),
            {headers: headers}
        ).catch((e) => {
            console.log(e);
            setIsDownloading(false);
            navigation('/login');
            return;
        });
        console.log("got form");
        const formDataKey = uuidv4();
        await setInDB(FORMS_DATA_STORE, formDataKey, response?.data);
        await setInDB(FORMS_METADATA_STORE, uuidv4(), {dataKey: formDataKey});
        setIsDownloading(false);

        //
        // db.transaction('form-data', 'readwrite').store.put({value: response?.data}, key).then((e) => {
        //     db.transaction('form-metadata', 'readwrite').store.put({dataKey: key, name: 'ahoj'}, uuidv4()).then(() => {
        //         setIsDownloading(false);
        //     }).catch((e) => {
        //         console.log('oopsie', e);
        //     });
        //
        // }).catch((e) => {
        //     console.log('oopsie', e);
        // });


        console.log("implement");
    };

    return (
        <div>
            <h1>Download Form</h1>
            {isDownloading && selectedForm ? (
                <p>Downloading {selectedForm.name}...</p>
            ) : (
                <div>
                    <p>Select a form to download:</p>
                    <ul>
                        {forms.map((form) => (
                            <li key={form.dataKey}>
                                {form.name}{' '}
                                <button onClick={() => handleDownloadClick(form)}>Download</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <Link to="/">Back to Dashboard</Link>
        </div>
    );
};

export default DownloadPage;