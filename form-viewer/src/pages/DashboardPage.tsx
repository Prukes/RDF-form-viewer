import React, {useEffect, useState} from 'react';
import {
    FORMS_DATA_STORE,
    FORMS_FILES_STORE,
    FORMS_METADATA_STORE,
    FORMS_RECORDS_STORE
} from "../constants/DatabaseConstants";
import FormsDBSchema, {FormDataContent, FormMetadata, FormRecord} from "../utils/FormsDBSchema";
import {deleteFromDB, getAllFromDBWithKeys, getFromDB, setInDB} from "../services/DBService";
import {Button, ButtonGroup, Col, Container, ListGroup, Row} from 'react-bootstrap';
import {BsDownload, BsSearch} from "react-icons/bs";
import RoutingConstants from "../constants/RoutingConstants";
import {useNavigate} from "react-router-dom";
import Layout from "../components/Layout";
import FilterModal from "../components/modals/FilterModal";
import Priority from "../utils/PriorityEnum";
import {apiService} from "../utils/ApiService";
import {RECORDS_URL} from "../constants/ApiConstants";
import {v4 as uuidv4} from 'uuid';
import {duplicateFormData, getMetadataCopyName} from "../utils/Utils";
import DashboardListItem from "../components/dashboard/DashboardListItem";
import ToastComponent from "../components/toasts/ToastComponent";
import axios from "axios";
import {ToastData} from "../types/Types";


const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState<FormsDBSchema['form-metadata'][]>([]);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [toastData, setToastData] = useState<ToastData>({
        toastMessageTitle: '',
        showToast: false,
        type: 'success',
        toastMessage: ''
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleClose = () => setShowFilterModal(false);

    const fetchForms = async () => {
        const formsMetadata: FormsDBSchema['form-metadata'][] = await getAllFromDBWithKeys<FormsDBSchema['form-metadata']>(FORMS_METADATA_STORE);
        console.log('forms', formsMetadata);
        formsMetadata.sort((a, b) => a.value.name.localeCompare(b.value.name));
        setForms(formsMetadata);
    };

    const backupForms = async () => {
        console.log('starting backup');
        const now = Date.now();
        const formsMetadata: FormsDBSchema['form-metadata'][] = await getAllFromDBWithKeys<FormsDBSchema['form-metadata']>(FORMS_METADATA_STORE);
        for (const form of formsMetadata) {
            const wasUpdated = form.value.wasUpdated;
            const lastServerUpload = form.value.lastServerUpload;
            const downloadDate = form.value.downloadDate;

            if (!wasUpdated) continue;
            console.log('backup form passed wasUpdated check: ', form);
            if (lastServerUpload) {
                const timeDiffms = now - lastServerUpload;
                const timeDiffDays = timeDiffms / 1000 / 60 / 60 / 24;

                if (timeDiffDays >= 30) {
                    try {
                        const formRecord: FormRecord = await getFromDB(FORMS_RECORDS_STORE, form.value.dataKey);
                        //TODO: send files
                        // const formFiles: FormFile[] = await getFromDB(FORMS_FILES_STORE, form.value.dataKey);

                        await sendRecordToServer(form, formRecord);


                    } catch (e) {
                        console.log(e);
                    }
                }
            } else if (downloadDate) {
                const timeDiffms = now - downloadDate;
                const timeDiffDays = timeDiffms / 1000 / 60 / 60 / 24;
                if (timeDiffDays >= 30) {
                    try {
                        const formRecord: FormRecord = await getFromDB(FORMS_RECORDS_STORE, form.value.dataKey);
                        //TODO: send files
                        // const formFiles: FormFile[] = await getFromDB(FORMS_FILES_STORE, form.value.dataKey);

                        await sendRecordToServer(form, formRecord);

                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchForms();
        backupForms();
        setIsLoading(false);
    }, []);

    const sendRecordToServer = async (formMetadata: FormsDBSchema['form-metadata'], formRec?: FormRecord) => {
        setIsLoading(true);
        let formRecord = formRec;
        if (formRecord === null || formRecord === undefined) {
            formRecord = await getFromDB(FORMS_RECORDS_STORE, formMetadata.value.dataKey);
        }
        console.log(formRecord);
        try {
            if (formRecord?.key) {
                console.log()
                const response = await apiService.put(`${RECORDS_URL}/${formRecord.key}`, formRecord, {headers: {'content-type': 'application/json'}});
                if (response.status !== 204) {
                    throw(response);
                }
                setToastData({
                    showToast: true,
                    toastMessage: 'Record was successfully updated.',
                    toastMessageTitle: 'Success',
                    type: 'success'
                });

            } else {
                const response = await apiService.post(RECORDS_URL, formRecord, {headers: {'content-type': 'application/json'}});
                console.log(response);
                if (response.status === 201) {
                    //TODO: set key to record
                    const locationHeader = response.headers.location;
                    console.log(locationHeader);
                    const supposedKey = locationHeader.substring(locationHeader.lastIndexOf('/') + 1, locationHeader.length);
                    if (supposedKey) {
                        const metadataUpdate = {
                            ...formMetadata.value,
                            hasRecord: true,
                            lastServerUpload: Date.now(),
                            wasUpdated: false
                        };
                        const responseRecord = await apiService.get(`${RECORDS_URL}/${supposedKey}`);
                        if (responseRecord.status === 200) {
                            const recUpdate = responseRecord.data;
                            await setInDB(FORMS_RECORDS_STORE, formMetadata.value.dataKey, recUpdate);
                            await setInDB(FORMS_METADATA_STORE, formMetadata.key, metadataUpdate);
                            console.log('all done');
                            setToastData({
                                showToast: true,
                                toastMessage: 'Record was successfully created and uploaded.',
                                toastMessageTitle: 'Success',
                                type: 'success'
                            });
                        } else {
                            throw(responseRecord);
                        }
                    }
                    console.log(supposedKey);
                    await fetchForms();
                } else {
                    throw(response);

                }
            }
        } catch (error) {
            setIsLoading(false);
            if (axios.isAxiosError(error)) {
                console.log(error);
                if (error.response) {
                    // Request made but the server responded with an error
                    if (error.response.status == 500) {
                        console.error(error);
                        setToastData({
                            showToast: true,
                            toastMessage: 'Internal server error',
                            toastMessageTitle: 'Error',
                            type: 'error'
                        });
                    } else if (error.response.status == 401) {
                        //Unauthorized
                        setToastData({
                            showToast: true,
                            toastMessage: 'You need to authorize in order to create server requests.',
                            toastMessageTitle: 'Unauthorized error',
                            type: 'error',
                            extra: <Button variant={'primary'} onClick={() => {
                                navigate(RoutingConstants.LOGIN)
                            }}>Login!</Button>
                        });
                    }
                    // Request made but the server did not respond
                } else if (error.request) {
                    console.error(error);
                    setToastData({
                        showToast: true,
                        toastMessage: 'Couldn\'t reach server. Maybe it\'s offline?',
                        toastMessageTitle: 'Error',
                        type: 'error'
                    });
                } else {
                    console.error(error);
                    // Error occured while setting up the request
                    setToastData({
                        showToast: true,
                        toastMessage: 'Something bad happened while setting up the request.',
                        toastMessageTitle: 'Error',
                        type: 'error'
                    });
                }
            } else {
                console.error(error);
            }
        }
    }
    const handleDuplicateClick = async (form: FormsDBSchema['form-metadata']) => {
        if (!form.value.hasRecord) {
            const newId = uuidv4();

            const metadataCopy: FormMetadata = {
                dataKey: newId,
                wasUpdated: false,
                name: getMetadataCopyName(form.value),
                priority: form.value.priority,
                tags: form.value.tags,
                description: form.value.description,
                hasRecord: false
            };
            const formData: FormDataContent = await getFromDB(FORMS_DATA_STORE, form.value.dataKey);
            const formRecord: FormRecord = await getFromDB(FORMS_RECORDS_STORE, form.value.dataKey);
            const recordCopy: FormRecord = {
                ...formRecord,
                localName: uuidv4(),
                dateCreated: Date.now()
            };

            console.log('formRecord: ', formRecord);
            console.log('recordCopy: ', recordCopy);
            if (formData) {
                const ff = duplicateFormData(formData);
                await setInDB(FORMS_DATA_STORE, newId, ff);
                await setInDB(FORMS_RECORDS_STORE, newId, recordCopy);
                await setInDB(FORMS_METADATA_STORE, newId, metadataCopy);
                console.log(ff);
                //TODO: udělat jinak / přidat kopii do již staženejch hodnot
                await fetchForms();
            } else {
                console.error("Couldn't find form data in indexedDB")
            }
        }


    }

    const handleOpenClick = (formMetadata: FormsDBSchema['form-metadata']) => {
        navigate(`${RoutingConstants.FORM}/${formMetadata.key}`, {state: formMetadata.value});
    };

    const handleEditClick = (formData: FormsDBSchema['form-metadata']) => {
        navigate(RoutingConstants.EDIT_FORM, {state: formData});
    };
    const handleRemoveClick = async (formObject: FormsDBSchema['form-metadata']) => {
        const formKey = formObject.key;
        const dataKey = formObject.value.dataKey;
        await deleteFromDB(FORMS_METADATA_STORE, formObject.key);
        await deleteFromDB(FORMS_DATA_STORE, dataKey);
        await deleteFromDB(FORMS_RECORDS_STORE, dataKey);
        await deleteFromDB(FORMS_FILES_STORE, dataKey);
        setForms((formsPrev) => {
            return formsPrev.filter((entry) => entry.key !== formKey)
        });
    };

    const filterForms = (name: string, priority: Priority, tag: string) => {
        console.log(name, priority, tag);
        setForms((prevForms) => {
            return prevForms.filter((entry) => {
                const entryData: FormMetadata = entry.value;
                const boolName = !name ? true : entryData.name?.includes(name) ?? false;
                const boolPriority = priority === Priority.DEFAULT ? true : entryData.priority === priority;
                const boolTag = !tag ? true : entryData.tags?.includes(tag) ?? false;

                return boolName && boolPriority && boolTag;
            });
        });
        setIsFiltering(true);
    }

    const handleExportClick = async (form: FormsDBSchema['form-metadata']) => {
        const file = await getFromDB(FORMS_DATA_STORE, form.value.dataKey);
        const jsonStr = JSON.stringify(file);
        const blob = new Blob([jsonStr], {type: 'text/plain'});
        // const filesArray = [new File([blob], "Ahoj", {type: blob.type})];

        //TODO: needs HTTPS to work most likely... the DOMException might be BS
        // https://stackoverflow.com/questions/56136692/notallowederror-must-be-handling-a-user-gesture-to-perform-a-share-request-nav
        // await fileSharing(filesArray);

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${form.value.name}.json`;
        link.click();

    };

    const fileSharing = async (filesArray: File[]) => {

        filesArray.forEach((f) => console.log(f.toString()));
        if (navigator.canShare && navigator.canShare({files: filesArray})) {
            navigator.share({
                files: filesArray,
                title: 'Form viewer files share',
                text: 'Sharing files from Form viewer app.',
            })
                .then(() => console.log('Share was successful.'))
                .catch((error) => console.log('Sharing failed', error));
        } else {
            console.log(`Your system doesn't support sharing files.`);
        }
    }

    const onDownloadRedirect = () => {
        navigate(RoutingConstants.DOWNLOAD);
    }
    const toastOnHide = () => {
        setToastData(prevState => {
            return {...prevState, showToast: false}
        });
    }
    const getNoFormsErrorMessage = () => {
        return isFiltering ? "No forms or records match the provided filter." : "No forms or records are currently downloaded.";
    }


    const specialButton =
        <ButtonGroup>
            <Button variant={isFiltering ? "info" : "success"} onClick={() => {
                setShowFilterModal(true);
            }}>
                <BsSearch/>
            </Button>
            <Button variant="success" onClick={onDownloadRedirect} className={"ms-2"}>
                <BsDownload/>
            </Button>
        </ButtonGroup>

    return (
        <Layout title={"Dashboard"} specialButton={specialButton} isLoading={isLoading}>
            <FilterModal show={showFilterModal} onHide={handleClose} filterFunction={filterForms}
                         isFiltering={isFiltering} stopFilterFunction={() => {
                fetchForms();
                setIsFiltering(false);
            }}></FilterModal>
            <ToastComponent message={toastData.toastMessage} title={toastData.toastMessageTitle}
                            type={toastData.type}
                            show={toastData.showToast} onHide={toastOnHide} extra={toastData.extra}
                            position={'bottom-center'}></ToastComponent>
            <Container fluid className="mobile-view-container">

                {forms.length != 0
                    ? <Row className="mobile-view-content mt-2">
                        <Col>
                            <ListGroup>
                                {forms.map((item) => (
                                    <DashboardListItem item={item}
                                                       handleOpenClick={handleOpenClick}
                                                       handleEditClick={handleEditClick}
                                                       handleRemoveClick={handleRemoveClick}
                                                       sendRecordToServer={sendRecordToServer}
                                                       handleExportClick={handleExportClick}
                                                       handleDuplicateClick={handleDuplicateClick}
                                    />
                                ))}
                            </ListGroup>
                        </Col>
                    </Row>
                    : <h2 className={"mt-4 text-center"}>{getNoFormsErrorMessage()}</h2>
                }

            </Container>
        </Layout>
    );
};

export default Dashboard;