import React, {ChangeEvent, useEffect, useState} from 'react';
import {Button, Container, Form} from 'react-bootstrap';
import Priority from "../utils/PriorityEnum";
import FormsDBSchema from "../utils/FormsDBSchema";
import Layout from "./Layout";
import {useLocation, useNavigate} from "react-router-dom";
import {setInDB} from "../services/DBService";
import {FORMS_METADATA_STORE} from "../constants/DatabaseConstants";
import {FaTimes} from "react-icons/all";


const EditForm: React.FC = () => {
    const navigation = useNavigate();
    const location = useLocation();
    const state: FormsDBSchema['form-metadata'] = location.state;
    const formMetadata = state.value;
    const [name, setName] = useState(formMetadata.name ?? '');
    const [priority, setPriority] = useState<Priority>(formMetadata.priority ?? Priority.DEFAULT);
    const [tags, setTags] = useState(formMetadata.tags ?? []);
    const [error, setError] = useState(null);

    const handleNameChange: React.ChangeEventHandler<HTMLInputElement> = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handlePriorityChange: React.ChangeEventHandler<HTMLInputElement> = (event: ChangeEvent<HTMLInputElement>) => {
        const prio = parseInt(event.target.value);
        setPriority(prio);
    };

    useEffect(() => {
        console.log(tags)
    },[tags]);

    const handleTagChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        setTags((prevTags) => {
            const tmp = [...prevTags];
            tmp[index] = event.target.value;
            return tmp;
        });
    };

    const handleDeleteTag = (index: number) => {
        const newTags = [...tags];
        newTags.splice(index, 1);
        setTags(newTags);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try{
            await setInDB(FORMS_METADATA_STORE,state.key,{...formMetadata, name, priority, tags});
        } catch (e:any){
            console.error(e);
            setError(e.toString());
        }

    };

    const formTags = tags.map((value, index) => {
        return <Form.Group controlId={`formTag-${index}`} key={`formTag-${index}`}>
            <Form.Label>Tag {index + 1}</Form.Label>
            <div className="d-flex align-items-center">
            <Form.Control
                type="text"
                placeholder="Enter tag"
                value={value}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    handleTagChange(event, index)
                }
            />
                <Button variant="link" className="p-0" onClick={() => handleDeleteTag(index)}>
                    <FaTimes />
                </Button>
            </div>
        </Form.Group>
    });

    const handleAddTag = () => {
        setTags([...tags, ""]);
    };

    if(error){
        return(
            <Layout onClickBack={() => {
                navigation(-1)
            }} title={`Edit form ${formMetadata.name}`}>
                <p>{error}</p>
                <Button variant="primary" className={"text-center mt-2"} onClick={() => {setError(null)}}></Button>
            </Layout>
        );
    }

    return (
        <Layout onClickBack={() => {
            navigation(-1)
        }} title={`Edit form ${formMetadata.name}`}>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter name" value={name} onChange={handleNameChange}/>
                </Form.Group>

                <Form.Group controlId="formPriority">
                    <Form.Label>Priority</Form.Label>
                    <Form.Control as="select" value={priority} onChange={handlePriorityChange}>
                        <option value={Priority.DEFAULT}>Any</option>
                        <option value={Priority.HIGH}>High</option>
                        <option value={Priority.MEDIUM}>Medium</option>
                        <option value={Priority.LOW}>Low</option>
                    </Form.Control>
                </Form.Group>

                {formTags}
                <Container className={"text-center mt-2"}>
                    <Button variant="secondary" onClick={handleAddTag}>
                        Add Tag
                    </Button>
                    <Button variant="primary" className="ml-2" type="submit">
                        Save!
                    </Button>
                </Container>
            </Form>
        </Layout>
    );
}

export default EditForm;