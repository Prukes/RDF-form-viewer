import React from "react";
import {FormRecord} from "../../utils/FormsDBSchema";
import {Button, Card, Container, Form} from "react-bootstrap";

type CardProps = {
    record: FormRecord,
    downloadRecord: Function,
    checkboxChanged: Function
}
const RecordCardItem:React.FC<CardProps> = (props) => {
    const record = props.record;
    return (
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
                            onClick={() => props.downloadRecord(record)}>Download</Button>
                    <Form.Check type={'checkbox'} id={`checkbox-${record?.key}`}
                                label={'Batch'}
                                onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                                    props.checkboxChanged(evt, record)
                                }}></Form.Check>
                </Container>
            </Card.Body>
        </Card>
    );
}

export default RecordCardItem;