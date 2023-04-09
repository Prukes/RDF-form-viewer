import React, {ChangeEvent, useState} from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Priority from "../../utils/PriorityEnum";

type FilterModalProps = {
    show: boolean;
    onHide: () => void;
    filterFunction: (name: string, priority: Priority, tag: string) => void;
};

function FilterModal(props: FilterModalProps) {
    const [name, setName] = useState('');
    const [priority, setPriority] = useState<Priority>(Priority.DEFAULT);
    const [tag, setTag] = useState('');

    const handleNameChange:React.ChangeEventHandler<HTMLInputElement> = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handlePriorityChange:React.ChangeEventHandler<HTMLInputElement> = (event: ChangeEvent<HTMLInputElement>) => {
        const prio = parseInt(event.target.value);
        setPriority(prio);
    };

    const handleTagChange:React.ChangeEventHandler<HTMLInputElement> = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTag(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Call the filter function passed down from props with the filter parameters
        props.filterFunction(name, priority, tag);
        // Close the modal
        props.onHide();
    };

    return (
        <Modal show={props.show} onHide={props.onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Filter Forms</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" placeholder="Enter name" value={name} onChange={handleNameChange} />
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

                    <Form.Group controlId="formTag">
                        <Form.Label>Tag</Form.Label>
                        <Form.Control type="text" placeholder="Enter tag" value={tag} onChange={handleTagChange} />
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Apply Filter
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default FilterModal;