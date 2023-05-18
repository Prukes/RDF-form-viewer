import {FormMetadata, Question} from "./FormsDBSchema";
import {v4 as uuidv4} from 'uuid';
import Priority from "./PriorityEnum";


export const createNewRecord = () => {
    return {
        localName: '',
        formTemplate: '',
        complete: false,
        isNew: true,
        state: {state: 1}
    }
}

export const createNewMetadata = (name: string, dateCreated: number): FormMetadata => {
    return {
        dataKey: uuidv4(),
        wasUpdated: false,
        priority: Priority.DEFAULT,
        downloadDate: dateCreated,
        name: name,
        hasRecord: false
    }
};

export const duplicateFormData = (form: any) => {
    let nameMap = {};
    try {
        nameMap = changeQuestionID(form, nameMap);
        renameEdges(form, nameMap);
    } catch (e) {
        console.error('Something went wrong during form duplication' + e);
    }

    return form;
}
const changeQuestionID = (form: any, nameMap: {}) => {
    let graph;
    if (form) {
        // @ts-ignore
        const parsedObject = form;
        if (parsedObject['@graph']) {
            graph = parsedObject['@graph'];
        } else {
            throw('Doesnt have property @graph');
        }
    } else {
        throw('Form value is undefined');
    }

    for (const obj of graph) {
        if (obj.hasOwnProperty('has-layout-class') && obj['has-layout-class'] == "form") {
            continue;
        }else if (obj['@type'] && obj['@type'] === 'doc:question') {
            const newId = `doc:question/${uuidv4()}`;
            const prevId = obj['@id'];
            // @ts-ignore
            nameMap[prevId] = newId;
            obj['@id'] = newId;
        }
    }

    return nameMap;
}

export const renameEdges = (form: any, nameMap: {}) => {
    let graph = form['@graph'];
    for (const obj of graph) {
        if (obj.hasOwnProperty('has-preceding-question')) {
            const prevEdgeName = obj['has-preceding-question'];
            // @ts-ignore
            const newEdgeName = nameMap[prevEdgeName];
            obj['has-preceding-question'] = newEdgeName;
        }

        if (obj.hasOwnProperty('has-possible-value')) {
            const prevHasPossibleValue = obj['has-possible-value'];
            if (Array.isArray(prevHasPossibleValue)) {
                for (let i = 0; i < prevHasPossibleValue.length; i++) {
                    const prevId = prevHasPossibleValue[i]['@id'];
                    // @ts-ignore
                    const newId = nameMap[prevId];
                    prevHasPossibleValue[i]['@id'] = newId;
                }
            } else {
                const prevId = prevHasPossibleValue['@id'];
                // @ts-ignore
                const newId = nameMap[prevId];
                prevHasPossibleValue['@id'] = newId;
            }
        }

        if (obj.hasOwnProperty('has_related_question')) {
            let prevHasRelatedQuestion = obj['has_related_question'];
            if (Array.isArray(prevHasRelatedQuestion)) {
                for (let i = 0; i < prevHasRelatedQuestion.length; i++) {
                    const prevId = prevHasRelatedQuestion[i];
                    // @ts-ignore
                    const newId = nameMap[prevId];
                    prevHasRelatedQuestion[i] = newId;
                }
            } else {
                const prevId = prevHasRelatedQuestion;
                // @ts-ignore
                const newId = nameMap[prevId];
                obj['has_related_question'] = newId;
            }
        }
    }
}

export const getMetadataCopyName = (metadata: FormMetadata) => {
    let newName;
    console.log(metadata);
    const indexOfOpeningBracket = metadata.name.lastIndexOf('(');
    const indexOfClosingBracket = metadata.name.lastIndexOf(')');
    if (indexOfOpeningBracket === -1) {
        newName = metadata.name + ' (1)';
    } else {
        const numeroString = metadata.name.substring(indexOfOpeningBracket + 1, indexOfClosingBracket);
        const copyNumber = parseInt(numeroString);
        console.log(numeroString);
        console.log(copyNumber);
        if (!isNaN(copyNumber)) {
            newName = `${metadata.name.substring(0, indexOfOpeningBracket - 1)} (${copyNumber + 1})`;
        } else {
            throw('Couldn\'t create name copy');
        }

    }
    return newName;
};

export const answerUriWorkaround = (formData: Question) => {
    if (formData.answers) {
        for (const answer of formData.answers) {
            if (answer.uri && answer.uri.startsWith('_')) {
                 delete answer.uri;
            }
        }
    }
    if (formData.subQuestions && formData.subQuestions.length) {
        for (const subQuestion of formData.subQuestions) {
            answerUriWorkaround(subQuestion);
        }
    }
};

export const checkData = (data: any, nameMap: {}) => {
    //data is flattened
    for (const obj of data['@graph']) {
        if (obj['@type'] && obj['@type'] === 'doc:question') {

            const prevId = obj['@id'];
            const indexOfLastSlash = prevId.lastIndexOf('/');
            if (indexOfLastSlash === -1) {
                const newId = `doc:question/${uuidv4()}`;
                // @ts-ignore
                nameMap[prevId] = newId;
                obj['@id'] = newId;
            } else if (obj['has-layout-class'] && (obj['has-layout-class'] === 'form' || (Array.isArray(obj['has-layout-class']) && obj['has-layout-class'].includes('form')))) {
                const newId = `doc:question/${uuidv4()}`;
                // @ts-ignore
                nameMap[prevId] = newId;
                obj['@id'] = newId;
            }
        }
    }
};
