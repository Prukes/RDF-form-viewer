import React, {ReactNode, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {API_URL, FORM_GEN_URL} from "../constants/ApiConstants";
import {v4 as uuidv4} from 'uuid';
import {FORMS_DATA_STORE, FORMS_METADATA_STORE, FORMS_RECORDS_STORE} from "../constants/DatabaseConstants";
import {setInDB} from "../services/DBService";
import {FormDataContent, FormMetadata, FormRecord} from "../utils/FormsDBSchema";
import {Alert, Button, Container} from "react-bootstrap";
import Layout from "../components/Layout";
import Priority from "../utils/PriorityEnum";
import RoutingConstants from "../constants/RoutingConstants";
import {apiService} from "../utils/ApiService";
import axios from "axios";
import ToastComponent from "../components/toasts/ToastComponent";
import FormDownloadTab from "../components/download/FormDownloadTab";
import RecordDownloadTab from "../components/download/RecordDownloadTab";
import {createNewMetadata, createNewRecord} from "../utils/Utils";
import {FormDownloadInputs} from "../types/Types";


const headers = {
    'Content-Type': 'application/json',
}

const DownloadPage: React.FC = () => {
    const [selectedForms, setSelectedForms] = useState<FormRecord[]>([]);
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
                const response = await apiService.get(`${API_URL}/rest/records`, {headers:headers});
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
                } else {
                    console.error(error);
                    setErrorMessage('Something went wrong...');
                }
                setIsLoading(false);
            }
        }

        fetchRecords();
    }, []);

    const downloadRecord = async (formRecord: FormRecord) => {
        setIsLoading(true);
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
                wasUpdated: false,
                hasRecord: true
            };
            // console.log(response?.data);
            await setInDB(FORMS_DATA_STORE, formDataKey, resData);
            await setInDB(FORMS_METADATA_STORE, uuidv4(), form_metadata);
            await setInDB(FORMS_RECORDS_STORE, formDataKey, formRecord);

            setIsLoading(false);

            await downloadPossibleValues(resData);
        } catch (e) {
            console.error(e);
            setErrorMessage(`Ooops, something went wrong while downloading form ${formRecord.localName}`);
            setIsLoading(false);
            setNeedsAuthentization(true);
            return;
        }
    };

    const downloadForm = async (data: FormDownloadInputs) => {
        setIsLoading(true);
        const newRecord = createNewRecord();
        newRecord.formTemplate = data.option['@id'];
        newRecord.localName = data.name;
        try{
            const responseFormGen = await apiService.post(FORM_GEN_URL, newRecord);
            console.log(responseFormGen);
            if (responseFormGen.status === 200) {
                const generatedForm: FormDataContent = responseFormGen.data;
                const dateCreated = Date.now();
                const defaultMetadata: FormMetadata = createNewMetadata(data.name, dateCreated);

                await setInDB(FORMS_DATA_STORE, defaultMetadata.dataKey, generatedForm);
                await setInDB(FORMS_RECORDS_STORE, defaultMetadata.dataKey, newRecord);
                await setInDB(FORMS_METADATA_STORE, uuidv4() as string, defaultMetadata);

                await downloadPossibleValues(generatedForm);
                setShowSuccessToast(true);
            } else {
                console.error('Oopsie', responseFormGen.data);
                setShowErrorToast(true);
                // setError('root',responseLogin.data);
            }
        } catch(e){
            //TODO: handle axios errors
            console.error(e);
            setShowErrorToast(true);
        }
        setIsLoading(false);

    };

    const downloadPossibleValues = async (formResponse: any) => {

        const FORM_GEN_POSSIBLE_VALUES_URL = `${API_URL}/rest/formGen/possibleValues`;
        for (const property of formResponse['@graph']) {
            const query = property['has-possible-values-query'];
            if (query) {
                await apiService.get(FORM_GEN_POSSIBLE_VALUES_URL, {params: {query: query}});
            }
        }
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

    return (
        <Layout onClickBack={handleClickBack} title={"Download page"} specialButton={specialButton}
                isLoading={isLoading}>
            <ToastComponent show={showSuccessToast} title={'Success'} type={'success'} delay={4000}
                            message={'Winner Winner Chicken Dinner'} onHide={() => setShowSuccessToast(false)}
                            position={'top-center'}></ToastComponent>
            <ToastComponent show={showErrorToast} title={'Error'} type={'error'} delay={4000}
                            message={'An error has occured.'} onHide={() => setShowErrorToast(false)}
                            position={'top-center'}></ToastComponent>

            {errorMessage &&
                <Container className={'justify-content-center'}>
                    <Alert variant="danger" dismissible onClose={() => setErrorMessage('')}>
                        <Alert.Heading>Error!</Alert.Heading>
                        <p>
                            {errorMessage}
                        </p>
                    </Alert>
                </Container>
            }
            <Container fluid className={"position-relative p-0"}>
                <Container>
                    {
                        tabIndex === 0 ?
                            <FormDownloadTab downloadForm={downloadForm}></FormDownloadTab> :
                            <RecordDownloadTab records={records} downloadRecord={downloadRecord} checkboxChanged={checkboxChanged}></RecordDownloadTab>
                    }
                </Container>
                <Container className={"d-flex position-fixed bottom-0"} style={{paddingBottom:"3.5rem"}}>
                    {
                        tabs.map((tab, i) =>
                            <Button className={"flex-grow-1"} key={i} id={`${tab.id}`} disabled={tabIndex === tab.id} onClick={() => handleTabClick(tab.id)}>{tab.tabTitle}</Button>
                        )
                    }
                </Container>
            </Container>
        </Layout>

    );
};

export default DownloadPage;