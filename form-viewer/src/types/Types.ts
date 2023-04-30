import React, {ReactNode} from "react";
import {FormRecord} from "../utils/FormsDBSchema";
import {ToastPosition} from "react-bootstrap/ToastContainer";

export type LayoutProps = {
    onClickBack?: React.MouseEventHandler<HTMLButtonElement> | undefined;
    children: ReactNode;
    title: string;
    specialButton?: ReactNode;
    isLoading?: boolean;
};

export type FormDownloadComponentProps = {
    records: FormRecord[];
    downloadRecord: Function;
    checkboxChanged: Function;
};

export type FormData = {
    name: string;
    template: string;
    file: FileList;
};

export type ToastProps = {
    message: string,
    title: string,
    type: string,
    show: boolean,
    onHide?: Function,
    position?: ToastPosition,
    delay?: number,
    extra?: ReactNode,
}

export type ToastData = {
    toastMessage: string,
    toastMessageTitle: string,
    showToast: boolean,
    type: string,
    extra?: ReactNode;

};

export type LoginInputs = {
    username: string,
    password: string,
};

export type LoginData = {
    errorMessage: string,
    loggedIn: boolean,
    success: boolean,
    username: string | null
}

export type FormDownloadInputs = {
    name: string,
    option: FormTemplate
};

export type FormTemplate = {
    '@id': string,
    'http://www.w3.org/2000/01/rdf-schema#label': { '@value': string }[],
    'http://www.w3.org/2000/01/rdf-schema#comment': { '@value': string }[]
}

export type FormDownloadTabProps = {
    downloadForm: Function;
}