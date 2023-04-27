import React from 'react';
import {Col, Container, Row} from "react-bootstrap";
// @ts-ignore
import JsonLdUtils from "jsonld-utils";
import RecordCardItem from "./RecordCardItem";
import {FormRecord} from "../../utils/FormsDBSchema";

type FormDownloadComponentProps = {
    records: FormRecord[];
    downloadRecord: Function;
    checkboxChanged: Function;
}

const RecordDownloadTab: React.FC<FormDownloadComponentProps> = props => {


    return (
            <Container fluid style={{paddingBottom: '3.5rem'}}>s
                {props.records.map((record) => (
                    <Row key={record?.key} className={"my-2"}>
                        <Col xs={12}>
                            <RecordCardItem key={record?.key} record={record} downloadRecord={props.downloadRecord}
                                            checkboxChanged={props.checkboxChanged}/>
                        </Col>
                    </Row>
                ))}
            </Container>

    );
};


export default RecordDownloadTab;