'use client'
import BreadCrumb from "../../BreadCrumb";
import MenuToggler from "../../MenuToggler";

import FilterTopBox from "@/components/dashboard-pages/employers-dashboard/candidates-search/components/FilterTopBox";
import FilterSidebar from "@/components/dashboard-pages/employers-dashboard/candidates-search/components/FilterSidebar";
import candidatesData from "@/data/candidatedata";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    addCandidateGender,
    addCategory,
    addDatePost,
    addDestination,
    addKeyword,
    addLocation,
    addPerPage,
    addSort,
    clearExperienceF,
    clearQualificationF,
    clearSkills,
    clearEducation,
    clearIndustry,
    clearExperienceLevel,
} from "@/features/filter/candidateFilterSlice";
import {
    clearDatePost,
    clearExperience,
    clearQualification,
} from "@/features/candidate/candidateSlice";
const index = ({ initialSearchData }) => {
    const [showFilter, setShowFilter] = useState(false);
    const [searchResultData, setSearchResultData] = useState(initialSearchData);
    const {
        keyword,
        location,
        destination,
        category,
        candidateGender,
        datePost,
        experiences,
        qualifications,
        skills,
        education,
        industries,
        experienceLevels,
        sort,
        perPage,
    } = useSelector((state) => state.candidateFilter);

    // sort handler
    const sortHandler = (e) => {
        dispatch(addSort(e.target.value));
    };

    // per page handler
    const perPageHandler = (e) => {
        const pageData = JSON.parse(e.target.value);
        dispatch(addPerPage(pageData));
    };
    const dispatch = useDispatch();
    const skillsFilter = (item) =>
        skills?.length
            ? skills.some((skill) =>
                item.skills.some((s) =>
                    s.toLowerCase().includes(skill.toLowerCase())
                )
            )
            : true;
    // keyword filter
    const keywordFilter = (item) =>
        keyword !== ""
            ? item?.name?.toLowerCase().includes(keyword?.toLowerCase()) && item
            : item;

    // location filter
    const locationFilter = (item) =>
        location !== ""
            ? item?.location?.toLowerCase().includes(location?.toLowerCase())
            : item;

    // destination filter
    const destinationFilter = (item) =>
        item?.destination?.min >= destination?.min &&
        item?.destination?.max <= destination?.max;

    // category filter
    const categoryFilter = (item) =>
        category !== ""
            ? item?.category?.toLocaleLowerCase() === category?.toLocaleLowerCase()
            : item;

    // gender filter
    const genderFilter = (item) =>
        candidateGender !== ""
            ? item?.gender.toLocaleLowerCase() ===
            candidateGender.toLocaleLowerCase() && item
            : item;

    // date-posted filter
    const datePostedFilter = (item) =>
        datePost !== "all" && datePost !== ""
            ? item?.created_at
                ?.toLocaleLowerCase()
                .split(" ")
                .join("-")
                .includes(datePost)
            : item;

    // experience filter
    const experienceFilter = (item) =>
        experiences?.length !== 0
            ? experiences?.includes(
                item?.experience?.split(" ").join("-").toLocaleLowerCase()
            )
            : item;

    // qualification filter
    const qualificationFilter = (item) =>
        qualifications?.length !== 0
            ? qualifications?.includes(
                item?.qualification?.split(" ").join("-").toLocaleLowerCase()
            )
            : item;

    // sort filter
    const sortFilter = (a, b) =>
        sort === "des" ? a.id > b.id && -1 : a.id < b.id && -1;



    const educationFilter = (item) =>
        education?.length
            ? education.some((edu) =>
                item.education.some((e) =>
                    e.toLowerCase().includes(edu.toLowerCase())
                )
            )
            : true;

    const industryFilter = (item) =>
        industries?.length
            ? industries.includes(item.industry)
            : true;

    const experienceLevelFilter = (item) =>
        experienceLevels?.length
            ? experienceLevels.includes(item.experienceLevel)
            : true;

    const clearHandler = () => {
        dispatch(addKeyword(""));
        dispatch(addLocation(""));
        dispatch(addDestination({ min: 0, max: 100 }));
        dispatch(addCategory(""));
        dispatch(addCandidateGender(""));
        dispatch(addDatePost(""));

        dispatch(clearExperienceF());
        dispatch(clearQualificationF());

        dispatch(clearSkills());
        dispatch(clearEducation());
        dispatch(clearIndustry());
        dispatch(clearExperienceLevel());

        dispatch(clearDatePost());
        dispatch(clearExperience());
        dispatch(clearQualification());
        setSelectedCandidates([]);
        dispatch(addSort(""));
        dispatch(addPerPage({ start: 0, end: 0 }));
    };

    useEffect(() => {
        setSearchResultData(initialSearchData);
    }, [initialSearchData]);

    const [selectedCandidates, setSelectedCandidates] = useState([]);
    return (

        <div className="dashboard-outer ls-section">

            <BreadCrumb title="Search Filters!" />

            {searchResultData && (
                <div className="alert alert-info mb-3">
                    <strong>Search data received</strong>
                    <div className="mt-2">
                        <small>
                            Payload: {searchResultData?.payload ? JSON.stringify(searchResultData.payload) : "No payload"}
                        </small>
                    </div>
                    <div className="mt-2">
                        <small>
                            Results: {searchResultData?.results ? JSON.stringify(searchResultData.results) : "No results"}
                        </small>
                    </div>
                </div>
            )}

            <div className="row align-items-start">

                <div className="px-2">

                    <div className="candidate-toolbar">

                        {/* Left Side */}
                        <div className="toolbar-group">

                            {/* Desktop Filter */}
                            <button
                                type="button"
                                className="toolbar-btn d-none d-lg-inline-flex"
                                onClick={() => setShowFilter(!showFilter)}
                            >
                                <i className={`las ${showFilter ? "la-eye-slash" : "la-filter"} me-2`}></i>
                                {showFilter ? "Hide Filters" : "Show Filters"}
                            </button>

                            {/* Mobile Filter */}
                            <button
                                type="button"
                                className="toolbar-btn d-lg-none"
                                data-bs-toggle="offcanvas"
                                data-bs-target="#filter-sidebar"
                            >
                                <i className="las la-filter me-2"></i>
                                Filters
                            </button>

                            <label className="select-all">
                                <input
                                    type="checkbox"
                                    checked={
                                        candidatesData.length > 0 &&
                                        selectedCandidates.length === candidatesData.length
                                    }
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedCandidates(candidatesData.map(item => item.id));
                                        } else {
                                            setSelectedCandidates([]);
                                        }
                                    }}
                                />
                                <span>Select All</span>
                            </label>

                            <button className="toolbar-btn">
                                <i className="las la-folder-plus"></i>
                                Add To
                                <i className="las la-angle-down ms-2"></i>
                            </button>

                            <button className="toolbar-btn">
                                <i className="las la-bell"></i>
                                Set Reminder
                                <i className="las la-angle-down ms-2"></i>
                            </button>

                        </div>

                        {/* Right Side */}
                        <div className="toolbar-group toolbar-right-group">

                            <div className="d-flex flex-wrap align-items-center gap-2">

                                <select
                                    className="form-select toolbar-select"
                                    value={sort}
                                    onChange={sortHandler}
                                >
                                    <option value="">Sort by</option>
                                    <option value="asc">Newest</option>
                                    <option value="des">Oldest</option>
                                </select>

                                <span className="text-nowrap">
                                    {candidatesData.length} Candidates
                                </span>

                                {(keyword !== "" ||
                                    location !== "" ||
                                    destination.min !== 0 ||
                                    destination.max !== 100 ||
                                    category !== "" ||
                                    candidateGender !== "" ||
                                    datePost !== "" ||
                                    experiences?.length !== 0 ||
                                    qualifications?.length !== 0 ||
                                    skills?.length !== 0 ||
                                    education?.length !== 0 ||
                                    industries?.length !== 0 ||
                                    experienceLevels?.length !== 0 ||
                                    sort !== "" ||
                                    perPage?.start !== 0 ||
                                    perPage?.end !== 0) && (
                                        <button
                                            className="btn btn-danger toolbar-clear-btn"
                                            onClick={clearHandler}
                                        >
                                            Clear All
                                        </button>
                                    )}

                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <div className="row align-items-start ">
                <div
                    className="offcanvas offcanvas-start"
                    tabIndex="-1"
                    id="filter-sidebar"
                    aria-labelledby="offcanvasLabel"
                >
                    <div className="offcanvas-header">


                        <h5 className="offcanvas-title">Filters</h5>

                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="offcanvas"
                        ></button>


                    </div>

                    {/* <div className="filter-footer">
                            <button
                                className="theme-btn btn-style-one w-100"
                                data-bs-dismiss="offcanvas"
                            >
                                Apply Filters
                            </button>
                        </div> */}

                    <div className="offcanvas-body">
                        <FilterSidebar />
                    </div>

                    <div className="filter-footer">
                        <button
                            className="theme-btn btn-style-one w-100"
                            data-bs-dismiss="offcanvas"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
                {/* End filter column for tablet and mobile devices */}

                {showFilter && (
                    <div className="filters-column d-none d-lg-block col-lg-3 pe-0">
                        <FilterSidebar />
                    </div>
                )}
                <div
                    className={
                        showFilter
                            ? "content-column col-lg-9 col-md-12 col-sm-12"
                            : "content-column col-lg-12 col-md-12 col-sm-12"
                    }
                >
                    <div className="ls-outer">
                        <FilterTopBox selectedCandidates={selectedCandidates}
                            setSelectedCandidates={setSelectedCandidates} />
                    </div>
                </div>
                {/* <!-- End Content Column --> */}
            </div>


        </div>

    );
};

export default index;