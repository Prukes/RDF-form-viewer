import {Toast, ToastContainer} from "react-bootstrap";
import React from "react";
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import {ToastPosition} from "react-bootstrap/ToastContainer";

type ToastProps = {
    message:string,
    title: string,
    type: string,
    show: boolean,
    onHide?: Function,
    position?: ToastPosition,
    delay?: number
}
const ToastComponent: React.FC<ToastProps> = (props) => {
    const autohide = props.delay != null ||props.delay != undefined;

    const handleHideToast = () => {
        if (props.onHide) {
            props.onHide();
        }
    };

    const getIcon = () => {
        if (props.type === 'success') {
            return <FaCheckCircle />;
        } else if (props.type === 'error') {
            return <FaExclamationCircle />;
        } else {
            return null;
        }
    };

    return (
        <ToastContainer className="p-3" position={props.position}>
            <Toast show={props.show} onClose={handleHideToast} delay={props.delay} autohide={autohide}>
                <Toast.Header>
                    {getIcon()}
                    <strong className="me-auto">{props.title}</strong>
                </Toast.Header>
                <Toast.Body>{props.message}</Toast.Body>
            </Toast>
        </ToastContainer>

    );
}

export default ToastComponent;