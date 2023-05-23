import React from "react";
import {Button, Dropdown, DropdownButton, ListGroup} from "react-bootstrap";
import {AiOutlineUpload, BiDownload, BiDuplicate, SiReacthookform} from "react-icons/all";
import {BsPencil, BsTrash} from "react-icons/bs";
import FormsDBSchema from "../../utils/FormsDBSchema";

type DashboardListItemProps = {
    item: FormsDBSchema['form-metadata'],
    handleOpenClick: (item: FormsDBSchema['form-metadata']) => void,
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
                    <Button variant="link" onClick={() => props.handleOpenClick(props.item)} className="p-0 me-3">
                        <SiReacthookform size={'2em'}/>
                    </Button>
                </div>
            </div>
            <div className="ms-auto">
                <DropdownButton title={"Actions"} variant="primary" align={"end"}>
                    <Dropdown.Item onClick={() => props.handleEditClick(props.item)}>
                        <BsPencil /> Edit attributes
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => props.handleRemoveClick(props.item)}>
                        <BsTrash color={"red"} /> Delete
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => props.sendRecordToServer(props.item)}>
                        <AiOutlineUpload /> Upload to server
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => props.handleExportClick(props.item)}>
                        <BiDownload color={"black"} /> Export
                    </Dropdown.Item>
                    {!props.item.value.hasRecord && (
                        <Dropdown.Item onClick={() => props.handleDuplicateClick(props.item)}>
                            <BiDuplicate color={"green"} /> Duplicate
                        </Dropdown.Item>
                    )}
                </DropdownButton>
            </div>

        </ListGroup.Item>
    );
};

export default DashboardListItem;