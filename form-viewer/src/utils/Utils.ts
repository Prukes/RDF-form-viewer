import {FormDataContent} from "./FormsDBSchema";
import {v4 as uuidv4} from 'uuid';

export const duplicateFormData = (form:any) => {
    let nameMap = {};
    try{
        nameMap = changeQuestionID(form, nameMap);
        renameEdges(form, nameMap);
    } catch(e){
        console.error('Something went wrong during form duplication' + e);
    }

    return form;
}
const changeQuestionID = (form:any, nameMap:{}) => {
    let graph;
    if(form){
        // @ts-ignore
        const parsedObject = form;
        if(parsedObject['@graph']){
            graph = parsedObject['@graph'];
        } else {
            throw('Doesnt have property @graph');
        }
    } else {
        throw('Form value is undefined');
    }

    for( const obj of graph){
        if(obj.hasOwnProperty('has-layout-class') && obj['has-layout-class'] == "form"){
            continue;
        }
        const newId = uuidv4();
        const prevId = obj['@id'];
        // @ts-ignore
        nameMap[prevId] = newId;
        obj['@id'] = newId;
    }

    return nameMap;
}

const renameEdges = (form:any, nameMap:{}) => {
    let graph = form['@graph'];
    for( const obj of graph){
        if(obj.hasOwnProperty('has-preceding-question')){
            const prevEdgeName = obj['has-preceding-question'];
            // @ts-ignore
            const newEdgeName = nameMap[prevEdgeName];
            obj['has-preceding-question'] = newEdgeName;
        }

        if(obj.hasOwnProperty('has-possible-value')){
            const prevHasPossibleValue = obj['has-possible-value'];
            if(Array.isArray(prevHasPossibleValue)){
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

        if(obj.hasOwnProperty('has_related_question')){
            let prevHasRelatedQuestion = obj['has_related_question'];
            if(Array.isArray(prevHasRelatedQuestion)){
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
                prevHasRelatedQuestion = newId;
            }
        }
    }
}
