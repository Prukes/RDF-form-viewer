import {DBSchema} from "idb";
import Priority from "./PriorityEnum";

export default interface FormsDBSchema extends DBSchema {
    'form-metadata': {
        key: string;
        value: FormMetadata;
    };
    'form-data': {
        key: string;
        value: FormDataContent;
    };
};

export interface FormDataContent {
    value?: string;
}

export interface FormMetadata {
    dataKey: string;
    priority?: Priority;
    name?:string;
    tags?:string[];
    description?:string;
}
