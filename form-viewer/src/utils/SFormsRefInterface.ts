export default interface SFormsRefInterface {
    context: {
        updateData: (e: any) => {};
        updateFormQuestionData: (t: any, r: any) => {};
        getData: () => {};
        getFormQuestionsData: (e: any) => {};
    };
    getFormData: () => {};
    getFormQuestionsData: () => {};
    handleStepChange: (e: any, n: any, r: any) => {};
    props: {
        mapComponent: (n: any, r: any) => {};
        modalView: boolean;
    };
    refs: object;
    renderWizardlessForm: () => {};
    state: any;
    updater: {
        enqueueForceUpdate: (e: any, t: any) => {};
        enqueueReplaceState: (e: any, t: any, n: any) => {};
        enqueueStateUpdate: (e: any, t: any, n: any) => {};
        isMounted: (e: any) => {};
    }
}