import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    jobList: {
        keyword: "",
        location: "",
        destination: {
            min: 0,
            max: 100,
        },
        category: "",
        jobType: [],
        companyType: [],
        jobTypeSelect: "",
        skills: [],
        education: [],
        industry: [],
        datePosted: "",
        experience: 0,
        salary: {
            min: 0,
            max: 20000,
        },
        tag: "",
    },
    jobSort: {
        sort: "",
        perPage: {
            start: 0,
            end: 0,
        },
    },
};

export const filterSlice = createSlice({
    name: "filter",
    initialState,
    reducers: {
        addKeyword: (state, { payload }) => {
            state.jobList.keyword = payload;
        },
        addLocation: (state, { payload }) => {
            state.jobList.location = payload;
        },
        addDestination: (state, { payload }) => {
            state.jobList.destination.min = payload.min;
            state.jobList.destination.max = payload.max;
        },
        addCategory: (state, { payload }) => {
            state.jobList.category = payload;
        },
        addJobType: (state, { payload }) => {
            const isExist = state.jobList.jobType.includes(payload);
            if (!isExist) {
                state.jobList.jobType.push(payload);
            } else {
                state.jobList.jobType = state.jobList.jobType.filter(
                    (item) => item !== payload
                );
            }
        },

        addSkill: (state, { payload }) => {
            const exists = state.jobList.skills.includes(payload);

            if (!exists) {
                state.jobList.skills.push(payload);
            } else {
                state.jobList.skills = state.jobList.skills.filter(
                    (item) => item !== payload
                );
            }
        },
        clearSkills: (state) => {
            state.jobList.skills = [];
        },

        addEducation: (state, { payload }) => {
            const exists = state.jobList.education.includes(payload);

            if (!exists) {
                state.jobList.education.push(payload);
            } else {
                state.jobList.education = state.jobList.education.filter(
                    (item) => item !== payload
                );
            }
        },

        setEducation: (state, action) => {
            state.jobList.education = action.payload;
        },

        clearEducation: (state) => {
            state.jobList.education = [];
        },
        addIndustry: (state, { payload }) => {
            const exists = state.jobList.industry.includes(payload);

            if (!exists) {
                state.jobList.industry.push(payload);
            } else {
                state.jobList.industry =
                    state.jobList.industry.filter(
                        (item) => item !== payload
                    );
            }
        },

        setIndustry: (state, action) => {
            state.jobList.industry = action.payload;
        },

        clearIndustry: (state) => {
            state.jobList.industry = [];
        },
        clearJobType: (state) => {
            state.jobList.jobType = [];
        },
        addJobTypeSelect: (state, { payload }) => {
            state.jobList.jobTypeSelect = payload;
        },
        addCompanyType: (state, { payload }) => {
            const isExist = state.jobList.companyType.includes(payload);

            if (!isExist) {
                state.jobList.companyType.push(payload);
            } else {
                state.jobList.companyType =
                    state.jobList.companyType.filter(
                        (item) => item !== payload
                    );
            }
        },
        clearCompanyType: (state) => {
            state.jobList.companyType = [];
        },

        addSkill: (state, { payload }) => {
            const exists = state.jobList.skills.includes(payload);

            if (!exists) {
                state.jobList.skills.push(payload);
            } else {
                state.jobList.skills = state.jobList.skills.filter(
                    (item) => item !== payload
                );
            }
        },

        setSkills: (state, action) => {
            state.jobList.skills = action.payload;
        },

        clearSkills: (state) => {
            state.jobList.skills = [];
        },

        addDatePosted: (state, { payload }) => {
            state.jobList.datePosted = payload;
        },
        addExperience: (state, { payload }) => {
            state.jobList.experience = payload;
        },

        clearExperience: (state) => {
            state.jobList.experience = 0;
        },
        addSalary: (state, { payload }) => {
            state.jobList.salary.min = payload.min;
            state.jobList.salary.max = payload.max;
        },
        addSort: (state, { payload }) => {
            state.jobSort.sort = payload;
        },
        addTag: (state, { payload }) => {
            state.jobList.tag = payload;
        },
        addPerPage: (state, { payload }) => {
            state.jobSort.perPage.start = payload.start;
            state.jobSort.perPage.end = payload.end;
        },
    },
});

export const {
    addKeyword,
    addLocation,
    addDestination,
    addCategory,
    addJobType,
    addCompanyType,
    clearJobType,
    clearCompanyType,
    addSkill,
    clearSkills,
    setSkills,
    addEducation,
    setEducation,
    clearEducation,
    addJobTypeSelect,
    addDatePosted,
    addExperience,
    addExperienceSelect,
    clearExperience,
    addIndustry,
    setIndustry,
    clearIndustry,
    addSalary,
    addTag,
    addSort,
    addPerPage,
} = filterSlice.actions;
export default filterSlice.reducer;
