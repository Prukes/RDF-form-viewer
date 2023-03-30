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
    'form-record':{
      key:string;
      value: FormRecord;
    };
};

export type FormsDBRecord<K extends keyof FormsDBSchema> = {
    key: string;
    value: FormsDBSchema[K]['value'];
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
export interface FormRecord {
    uri: string;
    key: string;
    formTemplate: string;
    localName: string;
    author: Author;
    dateCreated: number;
    lastModified: number;
    lastModifiedBy: Author;
    institution: Institution;
    question:Question;
}

export interface Question{
    subQuestions: Question[];
    answers: Answer[];
    origin:string;
    originPathId: string;
    types: string[]
}
export interface Answer{
    textValue:string;
    codeValue:string;
    origin:string;
    types:string[];
}

export interface Author {
    uri: string
    firstName: string
    lastName: string
    username: string
    emailAddress: string
    isInvited: boolean
    institution: Institution
    types: string[]
}

export interface Institution {
    uri: string
    key: string
    name: string
}


