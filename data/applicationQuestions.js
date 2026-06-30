const applicationQuestions = [
    {
        id: 1,
        key: "working",
        question: "Are you currently working?",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
    },

    {
        id: 2,
        key: "company",
        question: "What is the name of your current organization?",
        type: "text",
        required: true,
        showIf: {
            field: "working",
            value: "Yes",
        },
    },

    {
        id: 3,
        key: "experience",
        question: "Total Experience",
        type: "select",
        options: [
            "Fresher",
            "0-1 Years",
            "1-3 Years",
            "3-5 Years",
            "5+ Years",
        ],
        required: true,
    },

    {
        id: 4,
        key: "notice",
        question: "Notice Period",
        type: "select",
        options: [
            "Immediate",
            "15 Days",
            "30 Days",
            "60 Days",
            "90 Days",
        ],
        required: true,
    },

    {
        id: 5,
        key: "salary",
        question: "Current CTC",
        type: "text",
        required: false,
    },

    {
        id: 6,
        key: "expectedSalary",
        question: "Expected CTC",
        type: "text",
        required: false,
    },

    {
        id: 7,
        key: "relocate",
        question: "Are you willing to relocate?",
        type: "radio",
        options: ["Yes", "No"],
        required: true,
    },

    {
        id: 8,
        key: "resume",
        question: "Upload your latest resume",
        type: "file",
        required: true,
        accept: ".pdf,.doc,.docx"
    }
];

export default applicationQuestions;