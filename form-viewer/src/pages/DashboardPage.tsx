import React, {ReactNode, useEffect, useState} from 'react';
import {FORMS_DATA_STORE, FORMS_METADATA_STORE, FORMS_RECORDS_STORE} from "../constants/DatabaseConstants";
import FormsDBSchema from "../utils/FormsDBSchema";
import {deleteFromDB, getAllFromDBWithKeys} from "../services/DBService";
import {Container, Row, Col, ListGroup, Button, ButtonGroup, Modal} from 'react-bootstrap';
import {BsDownload, BsPencil, BsSearch, BsTrash} from "react-icons/bs";
import RoutingConstants from "../constants/RoutingConstants";
import {useNavigate} from "react-router-dom";
import Layout from "../components/Layout";
import {SiReacthookform} from "react-icons/all";
import FilterModal from "../components/FilterModal";
import Priority from "../utils/PriorityEnum";


const headers = {
    'Content-Type': 'application/json',
}
const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState<FormsDBSchema['form-metadata'][]>([]);
    const [modalState, setModalState] = useState({show:false,modal:null});

    const handleClose = () => setModalState(prevState => {
        console.log(prevState);
        return {
            modal:null,
            show:false
    }
    });
    const handleShow = (m?:any) => {
        console.log(m);
        setModalState({show:true, modal:m});
    }


    useEffect(() => {
        const fetchForms = async () => {
            const formsMetadata = await getAllFromDBWithKeys<FormsDBSchema['form-metadata']>(FORMS_METADATA_STORE);
            console.log('forms', formsMetadata);

            setForms(formsMetadata);

        };

        fetchForms();

    }, []);

    const handleOpenClick = (formDataKey: string) => {
        navigate(`${RoutingConstants.FORM}/${formDataKey}`);
    };
    const handleEditClick = (formDataKey: string) => {
        const mod = <FilterModal show={modalState.show} onHide={handleClose} filterFunction={filterForms} />;
        handleShow(mod);
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

    const filterForms = (name:string, priority:Priority, tag: string) => {
        console.log(name,priority,tag);
    }

    const specialButton = <ButtonGroup>
        <Button variant="success" onClick={() => {
            const mod = <FilterModal show={modalState.show} onHide={handleClose} filterFunction={filterForms} />;
            console.log('Filter button clicked');
            handleShow(mod);
        }}>
            <BsSearch/>
        </Button>
        <Button variant="success" href={RoutingConstants.DOWNLOAD} className={"ms-2"}>
            <BsDownload/>
        </Button>
    </ButtonGroup>;

    return (
        <Layout title={"Dashboard"} specialButton={specialButton}>
            {modalState.modal}
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
                                            <Button variant="link" onClick={() => handleEditClick(item.value.dataKey)}
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