import React, {useEffect, useState} from 'react';
import {FORMS_DATA_STORE, FORMS_FILES, FORMS_METADATA_STORE, FORMS_RECORDS_STORE} from "../constants/DatabaseConstants";
import FormsDBSchema, {FormDataContent, FormFile, FormMetadata, FormRecord} from "../utils/FormsDBSchema";
import {deleteFromDB, getAllFromDBWithKeys, getFromDB, setInDB} from "../services/DBService";
import {Button, ButtonGroup, Col, Container, ListGroup, Row} from 'react-bootstrap';
import {BsDownload, BsPencil, BsSearch, BsTrash} from "react-icons/bs";
import RoutingConstants from "../constants/RoutingConstants";
import {useNavigate} from "react-router-dom";
import Layout from "../components/Layout";
import {AiOutlineUpload, BiDownload, BiDuplicate, SiReacthookform} from "react-icons/all";
import FilterModal from "../components/modals/FilterModal";
import Priority from "../utils/PriorityEnum";
import {FaTimes} from "react-icons/all";
import {apiService} from "../utils/ApiService";
import {RECORDS_URL} from "../constants/ApiConstants";
import { v4 as uuidv4 } from 'uuid';
import {duplicateFormData} from "../utils/Utils";

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState<FormsDBSchema['form-metadata'][]>([]);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);

    const handleClose = () => setShowFilterModal(false);

    const fetchForms = async () => {
        const formsMetadata = await getAllFromDBWithKeys<FormsDBSchema['form-metadata']>(FORMS_METADATA_STORE);
        console.log('forms', formsMetadata);
        setForms(formsMetadata);
    };

    const backupForms = async () => {
        const now = Date.now();
        const formsMetadata = await getAllFromDBWithKeys<FormsDBSchema['form-metadata']>(FORMS_METADATA_STORE);
        for (const form of formsMetadata) {
            const value: FormMetadata = form.value;
            const wasUpdated = value.wasUpdated;
            const lastServerUpload = value.lastServerUpload;

            if (!wasUpdated) continue;
            if (lastServerUpload) {
                const timeDiffms = now - lastServerUpload;
                const timeDiffDays = timeDiffms / 1000 / 60 / 60 / 24;

                if (timeDiffDays >= 30) {
                    try {
                    const formRecord: FormRecord = await getFromDB(FORMS_RECORDS_STORE, value.dataKey);
                    const formFiles: FormFile[] = await getFromDB(FORMS_FILES, value.dataKey);
                    console.log(formRecord);
                    //TODO: send record
                    await sendRecordToServer(value, formRecord);

                    value.lastServerUpload = Date.now();

                    }catch(e){
                        console.log(e);
                    }
                }
            } else {
                value.lastServerUpload = Date.now();
                await setInDB(FORMS_METADATA_STORE,form.key,form.value);
            }
        }
    };

    useEffect(() => {
        fetchForms();
        backupForms();

    }, []);

    const sendRecordToServer = async ( formMetadata:FormMetadata,formRec?:FormRecord) => {
        let formRecord = formRec;
        if(formRecord === null || formRecord === undefined){
            formRecord = await getFromDB(FORMS_RECORDS_STORE, formMetadata.dataKey);
        }
        console.log(formRecord);
        try {
            if(formRecord?.key){
                const response = await apiService.put(`${RECORDS_URL}/${formRecord.key}`,formRecord,{headers:{'content-type':'application/json'}});

            } else {
                const response = await apiService.post(RECORDS_URL,formRecord,{headers:{'content-type':'application/json'}});
                console.log(response);
                if(response.status != 200){
                    console.log(response);
                }
            }
        } catch(e){
            console.error(e);
        }
    }
    const handleDuplicateClick = async (form:FormsDBSchema['form-metadata']) => {
        const newId = uuidv4();
        const metadataCopy:FormMetadata = {
            dataKey: newId,
            wasUpdated: false,
            name: form.value.name,
            priority: form.value.priority,
            tags: form.value.tags,
            description: form.value.description,
        };
        const formData:FormDataContent = await getFromDB(FORMS_DATA_STORE, form.value.dataKey);
        const formRecord: FormRecord = await getFromDB(FORMS_RECORDS_STORE, form.value.dataKey);
        const recordCopy:FormRecord = {
            localName: formRecord.localName,
            dateCreated: Date.now(),
            formTemplate: formRecord.formTemplate
        }
        console.log(formRecord);
        if(formData){
                const ff = duplicateFormData(formData);
                await setInDB(FORMS_DATA_STORE,newId, ff);
                await setInDB(FORMS_RECORDS_STORE, newId, recordCopy);
                await setInDB(FORMS_METADATA_STORE, newId, metadataCopy);
                console.log(ff);
                //TODO: udělat jinak / přidat kopii do již staženejch hodnot
                await fetchForms();
        } else {
            console.error("Couldn't find form data in indexedDB")
        }

    }

    const handleOpenClick = (formDataKey: string) => {
        navigate(`${RoutingConstants.FORM}/${formDataKey}`);
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
        setForms((formsPrev) => {
            return formsPrev.filter((entry) => entry.key !== formKey)
        });
    };

    const filterForms = (name: string, priority: Priority, tag: string) => {
        console.log(name, priority, tag);
        setForms((prevForms) => {
            return prevForms.filter((entry) => {
                const entryData: FormMetadata = entry.value;
                const boolName = !name ? true : entryData.name?.includes(name) ?? true;
                const boolPriority = priority === Priority.DEFAULT ? true : entryData.priority === priority;
                const boolTag = !tag ? true : entryData.tags?.includes(tag) ?? true;

                return boolName && boolPriority && boolTag;
            });
        });
        setIsFiltering(true);
    }

    const handleExportClick = async (form: FormsDBSchema['form-metadata']) => {
        const file = await getFromDB(FORMS_DATA_STORE, form.value.dataKey);
        const jsonStr = JSON.stringify(file);
        const blob = new Blob([jsonStr], { type: 'text/plain'});
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
        let shareData = {
            title: "MDN",
            text: "Learn web development on MDN!",
            url: "https://developer.mozilla.org",
        };
        if (!navigator.canShare) {
           console.log("navigator.canShare() not supported.");
        } else if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            console.log("navigator.canShare() supported. We can use navigator.share() to send the data.");
        } else {
            console.log("Specified data cannot be shared.");
        }


        filesArray.forEach((f) => console.log(f.toString()));
        if (navigator.canShare && navigator.canShare({ files: filesArray })) {
            navigator.share({
                files: filesArray,
                title: 'Vacation Pictures',
                text: 'Photos from September 27 to October 14.',
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

    const specialButton = <ButtonGroup>
        <Button variant={isFiltering ? "info" : "success"} onClick={() => {
            if (!isFiltering) {
                setShowFilterModal(true);
            } else {
                fetchForms();
                setIsFiltering(false);
            }

        }}>
            {isFiltering ? <FaTimes/> : <BsSearch/>}
        </Button>
        <Button variant="success" onClick={onDownloadRedirect} className={"ms-2"}>
            <BsDownload/>
        </Button>
    </ButtonGroup>;

    return (
        <Layout title={"Dashboard"} specialButton={specialButton}>
            <FilterModal show={showFilterModal} onHide={handleClose} filterFunction={filterForms}></FilterModal>

            <Container fluid className="mobile-view-container">
                <Row className="mobile-view-content mt-2">
                    <Col>
                        <ListGroup>
                            {forms.map((item) => (
                                <ListGroup.Item key={item.key.toString()}
                                                className="d-flex justify-content-between align-items-center">
                                    {item.value.name ?? 'DEFAULT'}
                                    <span className="d-flex align-items-center me-2">
                                        <ButtonGroup>
                                            <Button variant="link" onClick={() => handleOpenClick(item.value.dataKey)}
                                                    className="p-0 me-2">
                                                <SiReacthookform/>
                                            </Button>
                                            <Button variant="link" onClick={() => handleEditClick(item)}
                                                    className="p-0 me-2">
                                                <BsPencil/>
                                            </Button>
                                            <Button variant="link" onClick={() => handleRemoveClick(item)}
                                                    className="p-0 me-2">
                                                <BsTrash color={"red"}/>
                                            </Button>
                                            <Button variant="link" onClick={() => sendRecordToServer(item.value)}
                                                    className="p-0 me-2">
                                                <AiOutlineUpload/>
                                            </Button>
                                            <Button variant="link" onClick={() => handleDuplicateClick(item)}
                                                    className="p-0 me-2">
                                                <BiDuplicate color={"green"}/>
                                            </Button>
                                            <Button variant="link" onClick={() => handleExportClick(item)}
                                                    className="p-0 me-2">
                                                <BiDownload color={"black"}/>
                                            </Button>
                                        </ButtonGroup>
                                </span>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Col>
                </Row>

            </Container>
        </Layout>
    );
};

export default Dashboard;