import React, {useEffect, useState} from 'react';
import {FORMS_DATA_STORE, FORMS_METADATA_STORE, FORMS_RECORDS_STORE} from "../constants/DatabaseConstants";
import FormsDBSchema, {FormMetadata, FormRecord} from "../utils/FormsDBSchema";
import {deleteFromDB, getAllFromDBWithKeys, getFromDB, setInDB} from "../services/DBService";
import {Button, ButtonGroup, Col, Container, ListGroup, Row} from 'react-bootstrap';
import {BsDownload, BsPencil, BsSearch, BsTrash} from "react-icons/bs";
import RoutingConstants from "../constants/RoutingConstants";
import {useNavigate} from "react-router-dom";
import Layout from "../components/Layout";
import {SiReacthookform} from "react-icons/all";
import FilterModal from "../components/modals/FilterModal";
import Priority from "../utils/PriorityEnum";
import {FaTimes} from "react-icons/all";

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
                    const formRecord: FormRecord = await getFromDB(FORMS_RECORDS_STORE, value.dataKey);
                    console.log(formRecord);
                    //TODO: send record
                    //TODO: set last server upload
                    //TODO: send files
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
                const boolPriority = priority == Priority.DEFAULT ? true : entryData.priority === priority;
                const boolTag = !tag ? true : entryData.tags?.includes(tag) ?? true;

                return boolName && boolPriority && boolTag;
            });
        });
        setIsFiltering(true);
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
        <Button variant="success" href={RoutingConstants.DOWNLOAD} className={"ms-2"}>
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