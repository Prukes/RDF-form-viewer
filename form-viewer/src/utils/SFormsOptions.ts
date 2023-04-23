

const modalProps = {
    show: true,
    title: "Title",
};

const options = {
    i18n: {
        "wizard.next": "Next",
        "wizard.previous": "Previous",
        "section.expand": "Expand",
        "section.collapse": "Collapse",
    },
    intl: {
        locale: "cs",
    },
    modalView: false,
    modalProps,
    horizontalWizardNav: true,
    wizardStepButtons: true,
    enableForwardSkip: true,
    // "startingQuestionId": "http://vfn.cz/ontologies/vita-study/form/vs--assesment-evaluation-q-NOTEXISTS",
    startingStep: 0,
    debugMode: false,
    users: [
        {id: "http://fel.cvut.cz/people/max-chopart", label: "Max Chopart"},
        {
            id: "http://fel.cvut.cz/people/miroslav-blasko",
            label: "Miroslav Blasko",
        },
    ],
    currentUser: "http://fel.cvut.cz/people/max-chopart",
    icons: [
        {
            // id: Constants.ICONS.QUESTION_HELP,
            id: "questionHelp",
            // behavior: Constants.ICON_BEHAVIOR.ENABLE,
            behavior: "enable",
        }
    ],
};

export default options;