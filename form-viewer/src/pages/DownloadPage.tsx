import React, {ReactNode, useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import axios from "axios";
import {API_URL} from "../constants/ApiConstants";
import {v4 as uuidv4} from 'uuid';
import {FORMS_DATA_STORE, FORMS_METADATA_STORE, FORMS_RECORDS_STORE} from "../constants/DatabaseConstants";
import {setInDB} from "../services/DBService";
import {FormMetadata, FormRecord} from "../utils/FormsDBSchema";
import {Alert, Button, Card, Col, Container, Form, Row} from "react-bootstrap";
import RoutingConstants from "../constants/RoutingConstants";
import Layout from "../components/Layout";
import Priority from "../utils/PriorityEnum";


const headers = {
    'Content-Type': 'application/json',
}

const DownloadPage: React.FC = () => {
    const [selectedForms, setSelectedForms] = useState<FormRecord[]>([]);
    const [isDownloadingForm, setIsDownloadingForm] = useState(false);
    const [isDownloadingDropdown, setIsDownloadingDropdown] = useState(false);
    const [records, setRecords] = useState<FormRecord[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [importedData, setImportedData] = useState<any>(null);
    const navigation = useNavigate();

    let axiosCreds = axios.create({
        withCredentials: true
    });

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await axiosCreds.get(`${API_URL}/rest/records`);
                if (response.status === 200) {
                    setRecords(response.data)
                }
            } catch (e) {
                console.error(e);
                setIsDownloadingForm(false);
                navigation('/login');
                return;
            }
        }

        fetchRecords();
    }, []);

    const downloadForm = async (form: FormRecord) => {
        setIsDownloadingForm(true);

        const response = await axiosCreds.post(
            `${API_URL}/rest/formGen`,
            form,
            {headers: headers}
        ).catch((e) => {
            console.error(e);
            setIsDownloadingForm(false);
            navigation('/login');
            return;
        });
        // console.log("got form");
        const resData = response?.data;
        const formDataKey = uuidv4();
        const form_metadata: FormMetadata = {
            dataKey: formDataKey,
            name: form.localName,
            priority: Priority.MEDIUM,
            description: form.formTemplate,
            downloadDate: Date.now()
        };
        // console.log(response?.data);
        await setInDB(FORMS_DATA_STORE, formDataKey, resData);
        await setInDB(FORMS_METADATA_STORE, uuidv4(), form_metadata);
        await setInDB(FORMS_RECORDS_STORE, formDataKey, form);
        setIsDownloadingForm(false);
        setIsDownloadingDropdown(true);

        const FORM_GEN_POSSIBLE_VALUES_URL = `${API_URL}/rest/formGen/possibleValues`;
        for (const property of resData['@graph']) {
            const query = property['has-possible-values-query'];
            if (query) {
                await axiosCreds.get(FORM_GEN_POSSIBLE_VALUES_URL, {params: {query: query}});
            }
        }

        setIsDownloadingDropdown(false);
    };

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
            await setInDB(FORMS_DATA_STORE, formDataKey, importedData);
            await setInDB(FORMS_METADATA_STORE, uuidv4(), {dataKey: formDataKey});

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
                await downloadForm(formsCopy[formIndex]);
                formsCopy.splice(formIndex, 1);
                len--;
            } catch {
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

    if (errorMessage) {
        return (
            <Alert variant="danger" dismissible>
                <Alert.Heading>Error!</Alert.Heading>
                <p>
                    {errorMessage}
                </p>
            </Alert>
        );

    }
    const isDownloading = isDownloadingDropdown || isDownloadingForm;

    return (
        <Layout onClickBack={handleClickBack} title={"Download page"} specialButton={specialButton}>
            {!isDownloading ?

                <Container fluid style={{paddingBottom: '3.5rem'}}>
                    {selectedForms.map(form => {
                        return <p>{form.localName}</p>
                    })}
                    {records.map((record) => (
                        <Row key={record?.key} className={"my-2"}>
                            <Col xs={12}>
                                <Card>
                                    <Card.Body>
                                        <Card.Title>
                                            {record?.localName}

                                        </Card.Title>
                                        <Card.Text>{record?.formTemplate}</Card.Text>
                                        <Card.Text>Author: {record?.author.firstName} {record?.author?.lastName}</Card.Text>
                                        <Card.Text>Date
                                            Created: {new Date(record?.dateCreated).toLocaleString()}</Card.Text>
                                        <Card.Text>Last
                                            Modified: {new Date(record?.lastModified).toLocaleString()}</Card.Text>
                                        <Card.Text>Last Modified
                                            By: {record?.lastModifiedBy?.firstName} {record?.lastModifiedBy?.lastName}</Card.Text>
                                        <Card.Text>Institution: {record?.institution?.name}</Card.Text>
                                        <Container fluid className="d-flex justify-content-between align-items-center">
                                            <Button variant="primary"
                                                    onClick={() => downloadForm(record)}>Download</Button>
                                            <Form.Check type={'checkbox'} id={`checkbox-${record?.key}`}
                                                        label={'Batch'}
                                                        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                                                            checkboxChanged(evt, record)
                                                        }}></Form.Check>
                                        </Container>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    ))}
                </Container> : <div>
                    <h1>Download Form</h1>
                    <p>Downloading form or dropdown values...</p>

                    <Link to="/">Back to Dashboard</Link>
                </div>}
        </Layout>



        // <Navbar fixed="bottom" className="justify-content-between custom-navbar">
        //     <Nav.Item className="px-3">
        //         <Button variant="secondary" onClick={(_) => {navigation(-1)}}>
        //             <BsArrowLeft/>
        //         </Button>
        //     </Nav.Item>
        //     <Navbar.Text>{navTitle}</Navbar.Text>
        //     <Nav.Item className="px-3">
        //         <Button variant="success" href={RoutingConstants.DOWNLOAD}>
        //             <BsDownload/>
        //         </Button>
        //     </Nav.Item>
        // </Navbar>


    );


};

export default DownloadPage;