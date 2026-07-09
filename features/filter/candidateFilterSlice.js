import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    keyword: "",
    location: "",
    destination: {
        min: 0,
        max: 100,
    },
    category: "",
    candidateGender: "",
    datePost: "",

    experiences: [],
    qualifications: [],

    skills: [],
    education: [],
    industries: [],
    experienceLevels: [],

    sort: "",
    perPage: {
        start: 0,
        end: 0,
    },
};

export const candidateFilterSlice = createSlice({
    name: "candidate-filter-slice",
    initialState,
    reducers: {
        addKeyword: (state, { payload }) => {
            state.keyword = payload;
        },
        addLocation: (state, { payload }) => {
            state.location = payload;
        },
        addDestination: (state, { payload }) => {
            state.destination.min = payload.min;
            state.destination.max = payload.max;
        },
        addCategory: (state, { payload }) => {
            state.category = payload;
        },
        addCandidateGender: (state, { payload }) => {
            state.candidateGender = payload;
        },
        addDatePost: (state, { payload }) => {
            state.datePost = payload;
        },
        addExperience: (state, { payload }) => {
            const isExist = state.experiences.includes(payload);
            if (!isExist) {
                state.experiences.push(payload);
            } else {
                state.experiences = state.experiences.filter(
                    (item) => item !== payload
                );
            }
        },

        setSkills: (state, { payload }) => {
            state.skills = payload;
        },

        setEducation: (state, { payload }) => {
            state.education = payload;
        },

        setIndustry: (state, { payload }) => {
            state.industries = payload;
        },

        setExperienceLevel: (state, { payload }) => {
            state.experienceLevels = payload;
        },
        addSkill: (state, { payload }) => {
            const exists = state.skills.includes(payload);

            if (exists) {
                state.skills = state.skills.filter(item => item !== payload);
            } else {
                state.skills.push(payload);
            }
        },

        clearSkills: (state) => {
            state.skills = [];
        },

        addEducation: (state, { payload }) => {
            const exists = state.education.includes(payload);

            if (exists) {
                state.education = state.education.filter(item => item !== payload);
            } else {
                state.education.push(payload);
            }
        },

        clearEducation: (state) => {
            state.education = [];
        },

        addIndustry: (state, { payload }) => {
            const exists = state.industries.includes(payload);

            if (exists) {
                state.industries = state.industries.filter(item => item !== payload);
            } else {
                state.industries.push(payload);
            }
        },

        clearIndustry: (state) => {
            state.industries = [];
        },

        addExperienceLevel: (state, { payload }) => {
            const exists = state.experienceLevels.includes(payload);

            if (exists) {
                state.experienceLevels = state.experienceLevels.filter(item => item !== payload);
            } else {
                state.experienceLevels.push(payload);
            }
        },



        clearExperienceLevel: (state) => {
            state.experienceLevels = [];
        },
        clearExperienceF: (state) => {
            state.experiences = [];
        },
        addQualification: (state, { payload }) => {
            const isExist = state.qualifications.includes(payload);
            if (!isExist) {
                state.qualifications.push(payload);
            } else {
                state.qualifications = state.qualifications.filter(
                    (item) => item !== payload
                );
            }
        },
        clearQualificationF: (state) => {
            state.qualifications = [];
        },
        addSort: (state, { payload }) => {
            state.sort = payload;
        },
        addPerPage: (state, { payload }) => {
            state.perPage = payload;
        },
    },
});

export const {
    addKeyword,
    addLocation,
    addDestination,
    addCategory,
    addCandidateGender,
    addDatePost,
    addExperience,
    clearExperienceF,
    addQualification,
    clearQualificationF,
    addSkill,
    setSkills,
    clearSkills,
    addEducation,
    setEducation,
    clearEducation,

    addIndustry,
    setIndustry,
    clearIndustry,

    addExperienceLevel,
    setExperienceLevel,
    clearExperienceLevel,


    addSort,
    addPerPage,
} = candidateFilterSlice.actions;
export default candidateFilterSlice.reducer;
