import React from "react";
import {Button, ButtonGroup, ListGroup, Row} from "react-bootstrap";
import {AiOutlineUpload, BiDownload, BiDuplicate, SiReacthookform} from "react-icons/all";
import {BsPencil, BsTrash} from "react-icons/bs";
import FormsDBSchema from "../../utils/FormsDBSchema";

type DashboardListItemProps = {
    item: FormsDBSchema['form-metadata'],
    handleOpenClick: (dataKey: string) => void,
    handleEditClick: (item: FormsDBSchema['form-metadata']) => void,
    handleRemoveClick: (item: FormsDBSchema['form-metadata']) => void,
    sendRecordToServer: (item: FormsDBSchema['form-metadata']) => void,
    handleExportClick: (item: FormsDBSchema['form-metadata']) => void,
    handleDuplicateClick: (item: FormsDBSchema['form-metadata']) => void

}
const DashboardListItem: React.FC<DashboardListItemProps> = (props) => {
    return (
        <ListGroup.Item key={props.item.key.toString()}
                        className="d-flex align-items-center">
            <div className="d-flex align-items-center flex-grow-1">
                <div>{props.item.value.name ?? 'DEFAULT'}</div>
                <div className="ms-auto">
                    <Button variant="link" onClick={() => props.handleOpenClick(props.item.value.dataKey)} className="p-0 me-3">
                        <SiReacthookform size={'2em'}/>
                    </Button>
                </div>
            </div>
            <div className="ms-auto">
                <Row className={"justify-content-end mb-3"}>
                    <ButtonGroup>
                        <Button variant="link" onClick={() => props.handleEditClick(props.item)}
                                className="p-0 me-2">
                            <BsPencil/>
                        </Button>
                        <Button variant="link" onClick={() => props.handleRemoveClick(props.item)}
                                className="p-0 me-2">
                            <BsTrash color={"red"}/>
                        </Button>
                    </ButtonGroup>
                </Row>


                <Row className={"justify-content-end"}>
                    <ButtonGroup>
                        <Button variant="link" onClick={() => props.sendRecordToServer(props.item)}
                                className="p-0 me-3">
                            <AiOutlineUpload/>
                        </Button>
                        <Button variant="link" onClick={() => props.handleExportClick(props.item)}
                                className="p-0 me-3">
                            <BiDownload color={"black"}/>
                        </Button>
                        {!props.item.value.hasRecord &&
                            <Button variant="link"
                                    onClick={() => props.handleDuplicateClick(props.item)}
                                    className="p-0 me-3">
                                <BiDuplicate color={"green"}/>
                            </Button>
                        }
                    </ButtonGroup>
                </Row>
            </div>

        </ListGroup.Item>
    );
};

export default DashboardListItem;