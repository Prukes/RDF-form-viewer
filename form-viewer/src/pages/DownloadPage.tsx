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
import {apiService} from "../utils/ApiService";
import axios from "axios";
import ToastComponent from "../components/toasts/ToastComponent";
import FormDownloadTab from "../components/download/FormDownloadTab";
import RecordDownloadTab from "../components/download/RecordDownloadTab";
import 'react-tabs/style/react-tabs.css';


const headers = {
    'Content-Type': 'application/json',
}

const DownloadPage: React.FC = () => {
    const [selectedForms, setSelectedForms] = useState<FormRecord[]>([]);
    const [isDownloadingForm, setIsDownloadingForm] = useState(false);
    const [isDownloadingDropdown, setIsDownloadingDropdown] = useState(false);
    const [records, setRecords] = useState<FormRecord[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const navigation = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [needsAuthentization, setNeedsAuthentization] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);

    const tabs = [
        {
            id: 0,
            tabTitle: "Forms"
        },
        {
            id: 1,
            tabTitle: "Records"
        }
    ];


    useEffect(() => {
        console.log(selectedForms);

    }, [selectedForms]);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await apiService.get(`${API_URL}/rest/records`);
                if (response.status === 200) {
                    setRecords(response.data)
                    setIsLoading(false);
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error.response) {
                        // Request made but the server responded with an error
                        if (error.response.status == 500) {
                            console.error(error);
                            setErrorMessage('Internal server error. ' + error);
                            setNeedsAuthentization(true);
                        }
                        // Request made but the server did not respond
                    } else if (error.request) {
                        setErrorMessage('Server was unreachable. Please try again later or use the import.');
                    } else {
                        // Error occured while setting up the request
                    }
                    setIsDownloadingForm(false);
                } else {
                    console.error(error);
                    setIsDownloadingForm(false);
                    setErrorMessage('Something went wrong...');
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
                wasUpdated: false
            };
            // console.log(response?.data);
            await setInDB(FORMS_DATA_STORE, formDataKey, resData);
            await setInDB(FORMS_METADATA_STORE, uuidv4(), form_metadata);
            await setInDB(FORMS_RECORDS_STORE, formDataKey, formRecord);

            setIsDownloadingForm(false);

            await downloadPossibleValues(resData);
        } catch (e) {
            console.error(e);
            setErrorMessage(`Ooops, something went wrong while downloading form ${formRecord.localName}`);
            setIsDownloadingForm(false);
            setNeedsAuthentization(true);
            return;
        }
    };

    const downloadPossibleValues = async (formResponse: any) => {
        setIsDownloadingDropdown(true);

        const FORM_GEN_POSSIBLE_VALUES_URL = `${API_URL}/rest/formGen/possibleValues`;
        for (const property of formResponse['@graph']) {
            const query = property['has-possible-values-query'];
            if (query) {
                await apiService.get(FORM_GEN_POSSIBLE_VALUES_URL, {params: {query: query}});
            }
        }
        setShowSuccessToast(true);
        setIsDownloadingDropdown(false);
    }

    const handleClickBack: React.MouseEventHandler<HTMLButtonElement> = (e: React.MouseEvent<HTMLButtonElement>) => {
        navigation(-1);
    }


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
            } catch (e) {
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
    const handleTabClick = (index:number) => {
        setTabIndex(index);
    };

    const specialButton: ReactNode =
        <>
            {selectedForms.length > 0 ?
                <Button variant="success" onClick={() => handleBatchDownload()}>
                    Batch download
                </Button>
                : <Button variant="success" onClick={() => navigation(RoutingConstants.IMPORT_FORM)}>
                    Import form
                </Button>
            }
        </>;

    const isDownloading = isDownloadingDropdown || isDownloadingForm;

    if (needsAuthentization) {
        return (
            <Layout onClickBack={handleClickBack} title={"Download page"} specialButton={specialButton}>
                <Container fluid className={'justify-content-center'}>
                    <Alert variant="danger" dismissible onClose={() => setNeedsAuthentization(false)}>
                        <Alert.Heading>Error!</Alert.Heading>
                        <p>
                            User needs to authenticate. Importing a form is also an option :).
                        </p>
                        <Alert.Link>
                            <Button variant={'primary'} onClick={() => {
                                navigation(RoutingConstants.LOGIN)
                            }}>Login!</Button>
                        </Alert.Link>
                    </Alert>
                </Container>
            </Layout>
        );
    }

    if (isDownloading) {
        return (
            <Layout onClickBack={handleClickBack} title={"Download page"} specialButton={specialButton}
                    isLoading={isLoading}>
                <div>
                    <h1>Download Form</h1>
                    <p>Downloading form or dropdown values...</p>

                    <Link to={RoutingConstants.DASHBOARD}>Back to Dashboard</Link>
                </div>

            </Layout>
        );
    }


    return (
        <Layout onClickBack={handleClickBack} title={"Download page"} specialButton={specialButton}
                isLoading={isLoading}>
            <ToastComponent show={showSuccessToast} title={'Popiči'} type={'success'} delay={4000}
                            message={'Task failed unsuccessfully'} onHide={() => setShowSuccessToast(false)}
                            position={'top-center'}></ToastComponent>
            <ToastComponent show={showErrorToast} title={'Yikers'} type={'error'} delay={4000}
                            message={'Task failed successfully'} onHide={() => setShowErrorToast(false)}
                            position={'top-center'}></ToastComponent>

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
            <Container fluid className={"position-relative"}>
                <Container >
                    {
                        tabIndex === 0 ?
                            <FormDownloadTab></FormDownloadTab> :
                            <RecordDownloadTab records={records} downloadRecord={downloadRecord} checkboxChanged={checkboxChanged}></RecordDownloadTab>
                    }
                </Container>
                <Row className={"position-fixed bottom-0 w-100 justify-content-between"} style={{paddingBottom:"3.5rem"}}>
                    {
                        tabs.map((tab, i) =>
                            <Button key={i} id={`${tab.id}`} disabled={tabIndex === tab.id} onClick={() => handleTabClick(tab.id)}>{tab.tabTitle}</Button>
                        )
                    }
                </Row>
            </Container>
        </Layout>

    );
};

export default DownloadPage;