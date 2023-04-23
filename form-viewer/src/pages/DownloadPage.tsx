import React, {ReactNode, useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {API_URL} from "../constants/ApiConstants";
import {v4 as uuidv4} from 'uuid';
import {FORMS_DATA_STORE, FORMS_METADATA_STORE, FORMS_RECORDS_STORE} from "../constants/DatabaseConstants";
import {setInDB} from "../services/DBService";
import {FormMetadata, FormRecord} from "../utils/FormsDBSchema";
import {Alert, Button, Col, Container, Row, Toast} from "react-bootstrap";
import Layout from "../components/Layout";
import Priority from "../utils/PriorityEnum";
import RoutingConstants from "../constants/RoutingConstants";
import {apiService} from "../utils/apiService";
import axios from "axios";
import RecordCardItem from "../components/download/RecordCardItem";


const headers = {
    'Content-Type': 'application/json',
}

const DownloadPage: React.FC = () => {
    const [selectedForms, setSelectedForms] = useState<FormRecord[]>([]);
    const [isDownloadingForm, setIsDownloadingForm] = useState(false);
    const [isDownloadingDropdown, setIsDownloadingDropdown] = useState(false);
    const [records, setRecords] = useState<FormRecord[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [importedData, setImportedData] = useState<any>(null);
    const navigation = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showToast, setToast] = useState(false)


    useEffect(() => {
        console.log(selectedForms);

    },[selectedForms]);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await apiService.get(`${API_URL}/rest/records`);
                if (response.status === 200) {
                    setRecords(response.data)
                    setIsLoading(false);
                }
            } catch (error) {
                if( axios.isAxiosError(error)){
                    if (error.response) {
                        // Request made but the server responded with an error
                        if(error.response.status == 500){
                            console.error(error);
                            setErrorMessage('Internal server error. ' + error);
                            navigation(RoutingConstants.LOGIN);
                        }

                    } else if (error.request) {
                        setErrorMessage('Server was unreachable. Please try again later or use the import.');
                    } else {
                        // Error occured while setting up the request
                    }
                } else {
                    console.error(error);
                    setIsDownloadingForm(false);
                    setErrorMessage('Something went wrong...');
                    console.error(error);
                }
                setIsLoading(false);
            }
        }

        fetchRecords();
    }, []);

    const downloadRecord = async (formRecord: FormRecord) => {
        setIsDownloadingForm(true);
        try {
            const response = await apiService.post(
                `${API_URL}/rest/formGen`,
                formRecord,
                {headers: headers}
            );
            // console.log("got form");
            const resData = response.data;
            const formDataKey = uuidv4();
            const form_metadata: FormMetadata = {
                dataKey: formDataKey,
                name: formRecord.localName,
                priority: Priority.MEDIUM,
                description: formRecord.formTemplate,
                downloadDate: Date.now(),
                wasUpdated:false
            };
            // console.log(response?.data);
            await setInDB(FORMS_DATA_STORE, formDataKey, resData);
            await setInDB(FORMS_METADATA_STORE, uuidv4(), form_metadata);
            await setInDB(FORMS_RECORDS_STORE, formDataKey, formRecord);

            setIsDownloadingForm(false);

            await downloadPossibleValues(resData);
        } catch(e){
            console.error(e);
            setErrorMessage(`Ooops, something went wrong while downloading form ${formRecord.localName}`);
            setIsDownloadingForm(false);
            navigation('/login');
            return;
        }
    };

    const downloadPossibleValues = async (formResponse:any) => {
        setIsDownloadingDropdown(true);

        const FORM_GEN_POSSIBLE_VALUES_URL = `${API_URL}/rest/formGen/possibleValues`;
        for (const property of formResponse['@graph']) {
            const query = property['has-possible-values-query'];
            if (query) {
                await apiService.get(FORM_GEN_POSSIBLE_VALUES_URL, {params: {query: query}});
            }
        }

        setIsDownloadingDropdown(false);
    }

    const handleClickBack: React.MouseEventHandler<HTMLButtonElement> = (e: React.MouseEvent<HTMLButtonElement>) => {
        navigation(-1);
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result as string);
                setImportedData(data);
                setErrorMessage("");
            } catch (error) {
                setErrorMessage("Error parsing JSON file.");
            }
        };
        reader.readAsText(file);
    };

    const handleSaveToIndexedDB = async () => {
        try {
            const formDataKey = uuidv4();
            const formMetadata: FormMetadata = {dataKey: formDataKey, wasUpdated: false, downloadDate:Date.now(), priority: Priority.MEDIUM};
            await setInDB(FORMS_DATA_STORE, formDataKey, importedData);
            await setInDB(FORMS_METADATA_STORE, uuidv4(), formMetadata);
            setToast(true);

        } catch (e: any) {
            setErrorMessage(e);
        }
        setImportedData(null);
    };

    const handleBatchDownload = async () => {
        const formsCopy = [...selectedForms];
        let len = formsCopy.length;
        while (len) {
            const formIndex = len - 1;
            console.log(formsCopy[formIndex]);
            try {
                await downloadRecord(formsCopy[formIndex]);
                formsCopy.splice(formIndex, 1);
                len--;
            } catch(e){
                console.error('caught in batch download');
                setSelectedForms(formsCopy);
                return;
            }
        }
        setSelectedForms(formsCopy);
    }

    const checkboxChanged = (event: React.ChangeEvent<HTMLInputElement>, form: FormRecord) => {
        if (event.target.checked) {
            setSelectedForms(forms => [...forms, form]);
        } else {
            setSelectedForms(forms => {
                return forms.filter(f => f !== form);
            });
        }


    };

    const specialButton: ReactNode =
        <>
            {selectedForms.length > 0 ?
                <Button variant="success" onClick={() => handleBatchDownload()}>
                    Batch download
                </Button>
                : !importedData ?
                    <>
                        <input
                            id={"import-form-input"}
                            type="file"
                            accept=".json"
                            onChange={handleFileSelect}
                            style={{display: "none"}}
                        />
                        <Button variant="primary" onClick={() => document.getElementById("import-form-input")?.click()}>
                            Import JSON file
                        </Button>
                    </>
                    :
                    <Button variant="success" onClick={() => handleSaveToIndexedDB()}>
                        Save to IndexedDB
                    </Button>
            }
        </>;

    const isDownloading = isDownloadingDropdown || isDownloadingForm;

    return (
        <Layout onClickBack={handleClickBack} title={"Download page"} specialButton={specialButton} isLoading={isLoading}>
            {errorMessage &&
                <Container fluid className={'justify-content-center'}>
                    <Alert variant="danger" dismissible onClose={() => setErrorMessage('')}>
                        <Alert.Heading>Error!</Alert.Heading>
                        <p>
                            {errorMessage}
                        </p>
                    </Alert>
                </Container>
            }
            {!isDownloading ?

                <Container fluid style={{paddingBottom: '3.5rem'}}>
                    {selectedForms.map(form => {
                        return <p>{`${form.localName} key: ${form.key}`}</p>
                    })}
                    {records.map((record) => (
                        <Row key={record?.key} className={"my-2"}>
                            <Col xs={12}>
                                <RecordCardItem key={record?.key} record={record} downloadRecord={downloadRecord} checkboxChanged={checkboxChanged}/>
                            </Col>
                        </Row>
                    ))}
                </Container> :
                <div>
                    <h1>Download Form</h1>
                    <p>Downloading form or dropdown values...</p>

                    <Link to={RoutingConstants.DASHBOARD}>Back to Dashboard</Link>
                </div>
            }
            <Toast style={{alignSelf:"bottom"}}
                onClose={() => setToast(false)}
                autohide
                show={showToast}
                delay={2200}
            >
                <Toast.Header>
                    <strong className="mr-auto">React Toast</strong>
                    <small>50 mins ago</small>
                </Toast.Header>
                <Toast.Body>Lorem ipsum dolor sit adipiscing elit.</Toast.Body>
            </Toast>
        </Layout>

    );


};

export default DownloadPage;