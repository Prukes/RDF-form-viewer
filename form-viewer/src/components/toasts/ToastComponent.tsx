import {Toast, ToastContainer} from "react-bootstrap";
import React from "react";
import {FaCheckCircle, FaExclamationCircle} from 'react-icons/fa';
import {ToastProps} from "../../types/Types";


const ToastComponent: React.FC<ToastProps> = (props) => {
    const autohide = !!props.delay;

    const handleHideToast = () => {
        if (props.onHide) {
            props.onHide();
        }
    };

    const getIcon = () => {
        if (props.type === 'success') {
            return <FaCheckCircle/>;
        } else if (props.type === 'error') {
            return <FaExclamationCircle/>;
        } else {
            return null;
        }
    };


    return (
        <ToastContainer className="p-3" position={props.position ?? 'top-center'}>
            <Toast show={props.show} onClose={handleHideToast} delay={props.delay} autohide={autohide}>
                <Toast.Header>
                    {getIcon()}
                    <strong className="me-auto">{props.title}</strong>
                </Toast.Header>
                <Toast.Body>
                    <>
                        <p>{props.message}</p>
                        <div>{props.extra}</div>
                    </>
                </Toast.Body>
            </Toast>
        </ToastContainer>

    );
}

export default ToastComponent;