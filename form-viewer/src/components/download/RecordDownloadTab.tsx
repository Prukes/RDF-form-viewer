import React from 'react';
import {Col, Container, Row} from "react-bootstrap";
// @ts-ignore
import JsonLdUtils from "jsonld-utils";
import RecordCardItem from "./RecordCardItem";
import {FormDownloadComponentProps} from "../../types/Types";



const RecordDownloadTab: React.FC<FormDownloadComponentProps> = props => {


    if(!props.records.length){
        return(
            <Container>
                <h1 className={'text-center'}>
                    No records to download or no connection
                </h1>
            </Container>
        );
    }
    return (
            <Container fluid style={{paddingBottom: '3.5rem'}}>
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