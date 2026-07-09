"use client";

import { useState } from "react";
import Select, { components } from "react-select";
import CreatableSelect from "react-select/creatable";


const SearchFilterBox = () => {
    const [keywordInput, setKeywordInput] = useState("");
    const [keywords, setKeywords] = useState([]);
    const [currency, setCurrency] = useState("INR");
    const [mandatoryKeywords, setMandatoryKeywords] = useState(false);
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [selectedIndustries, setSelectedIndustries] = useState([]);
    const [minExperience, setMinExperience] = useState("");
    const [maxExperience, setMaxExperience] = useState("");
    const [selectedKeywords, setSelectedKeywords] = useState([]);

    const [selectedCompanyTypes, setSelectedCompanyTypes] = useState([]);
    const [location, setLocation] = useState("");
    const [company, setCompany] = useState("");
    const [designation, setDesignation] = useState("");

    const [minSalary, setMinSalary] = useState("");
    const [maxSalary, setMaxSalary] = useState("");

    const [noticePeriod, setNoticePeriod] = useState("");
    const [relocate, setRelocate] = useState(false);
    const [remoteCandidates, setRemoteCandidates] = useState(false);
    const addKeyword = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const value = keywordInput.trim();

            if (!value) return;

            if (!keywords.includes(value)) {
                setKeywords([...keywords, value]);
            }

            setKeywordInput("");
        }
    };

    const removeKeyword = (index) => {
        setKeywords(keywords.filter((_, i) => i !== index));
    };

    const clearFilters = () => {
        // Keywords
        setKeywords([]);
        setSelectedKeywords([]);
        setKeywordInput("");
        setMandatoryKeywords(false);
        setMinExperience("");
        setMaxExperience("");
        setLocation("");
        setRelocate(false);
        setRemoteCandidates(false);
        setCompany("");
        setDesignation("");
        setSelectedDepartments([]);
        setSelectedIndustries([]);
        setSelectedCompanyTypes([]);
        setCurrency("INR");
        setMinSalary("");
        setMaxSalary("");
        setSelectedNoticePeriods([]);
        setNoticePeriod("");


    };
    const handleSearch = () => {
        const filters = {
            keywords,
            mandatoryKeywords,
            experience: {
                min: minExperience,
                max: maxExperience,
            },
            location,
            company,
            designation,
            salary: {
                min: minSalary,
                max: maxSalary,
            },
            noticePeriod,
        };

        console.log(filters);
    };

    const keywordOptions = [
        { value: "React", label: "React", type: "Skill" },
        { value: "Next.js", label: "Next.js", type: "Skill" },
        { value: "Node.js", label: "Node.js", type: "Skill" },
        { value: "JavaScript", label: "JavaScript", type: "Skill" },

        { value: "Frontend Developer", label: "Frontend Developer", type: "Designation" },
        { value: "Software Engineer", label: "Software Engineer", type: "Designation" },

        { value: "Team Lead", label: "Team Lead", type: "Role" },
        { value: "Project Manager", label: "Project Manager", type: "Role" },
    ];

    const departmentOptions = [
        { value: "Software Development", label: "Engineering → Software Development" },
        { value: "Backend Developer", label: "Engineering → Backend Developer" },
        { value: "Frontend Developer", label: "Engineering → Frontend Developer" },
        { value: "DBA", label: "Engineering → DBA / Data Warehouse" },
        { value: "QA Engineer", label: "Engineering → QA Engineer" },
    ];

    const industryOptions = [
        { value: "Software Product", label: "Software Product" },
        { value: "IT Services", label: "IT Services & Consulting" },
        { value: "Emerging Tech", label: "Emerging Technologies" },
        { value: "FinTech", label: "FinTech" },
        { value: "Healthcare", label: "Healthcare" },
    ];

    const companyTypeOptions = [
        "Indian MNC",
        "Foreign MNC",
        "Govt/PSU",
        "Startup",
        "Corporate",
    ];

    const noticePeriodOptions = [
        "Any",
        "0-15 Days",
        "1 month",
        "2 months",
        "3 months",
        "More than 3 months",
        "Current Company Notice Period",
    ];

    const [selectedNoticePeriods, setSelectedNoticePeriods] = useState([]);

    const Option = (props) => (
        <components.Option {...props}>
            {props.data.type === "Skill" && (
                <span style={{ color: "#1967d2", marginRight: 6 }}>★</span>
            )}

            {props.data.label}

            <span
                style={{
                    float: "right",
                    color: "#888",
                    fontSize: 12,
                }}
            >
                {props.data.type}
            </span>
        </components.Option>
    );

    const MultiValueLabel = (props) => (
        <components.MultiValueLabel {...props}>
            {props.data.type === "Skill" && (
                <span style={{ color: "#1967d2", marginRight: 4 }}>★</span>
            )}

            {props.data.label}
        </components.MultiValueLabel>
    );


    const toggleCompanyType = (type) => {
        if (selectedCompanyTypes.includes(type)) {
            setSelectedCompanyTypes(
                selectedCompanyTypes.filter((item) => item !== type)
            );
        } else {
            setSelectedCompanyTypes([...selectedCompanyTypes, type]);
        }
    };
    const toggleNoticePeriod = (period) => {
        if (selectedNoticePeriods.includes(period)) {
            setSelectedNoticePeriods(
                selectedNoticePeriods.filter((item) => item !== period)
            );
        } else {
            setSelectedNoticePeriods([...selectedNoticePeriods, period]);
        }
    };
    return (
        <div className="tabs-box">


            <div className="widget-content">
                <form className="default-form">
                    <div className="row">

                        {/* Keywords */}
                        <div className="form-group col-lg-12">
                            <label>Keywords</label>

                            <CreatableSelect
                                instanceId="candidate-keywords"
                                isMulti
                                options={keywordOptions}
                                value={selectedKeywords}
                                onChange={(selected) => setSelectedKeywords(selected || [])}
                                placeholder="Search skills, designation, role..."
                                classNamePrefix="custom-select"
                                className="basic-multi-select"
                                components={{
                                    Option,
                                    MultiValueLabel,
                                }}
                                closeMenuOnSelect={false}
                                hideSelectedOptions={false}
                                formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                                onCreateOption={(inputValue) => {
                                    const newOption = {
                                        value: inputValue,
                                        label: inputValue,
                                        type: "Skill", // New keywords default to Skill
                                    };

                                    setSelectedKeywords((prev) => [...prev, newOption]);
                                }}
                            />
                        </div>

                        {/* Experience */}

                        <div className="form-group col-lg-8">
                            <label>Experience</label>

                            <div className="experience-wrapper">

                                <input
                                    type="number"
                                    value={minExperience}
                                    onChange={(e) => setMinExperience(e.target.value)}
                                    placeholder="Min experience"
                                />

                                <span className="experience-text">to</span>

                                <input
                                    type="number"
                                    value={maxExperience}
                                    onChange={(e) => setMaxExperience(e.target.value)}
                                    placeholder="Max experience"
                                />

                                <span className="experience-text">Years</span>

                            </div>
                        </div>
                        {/* Location */}

                        <div className="form-group col-lg-8 col-md-6">
                            <label>Current location of candidate</label>

                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Current Location"
                            />

                            <div className="location-options">

                                <label className="checkbox-option">
                                    <input
                                        type="checkbox"
                                        checked={relocate}
                                        onChange={(e) => setRelocate(e.target.checked)}
                                    />
                                    <strong>  Include candidates who prefer to relocate to above location</strong>
                                </label>

                                <label className="checkbox-option">
                                    <input
                                        type="checkbox"
                                        checked={remoteCandidates}
                                        onChange={(e) => setRemoteCandidates(e.target.checked)}
                                    />
                                    <span>Exclude candidate who have mentioned that they are open to remote work only</span>
                                </label>

                            </div>
                        </div>

                        {/* Salary */}
                        <div className="form-group col-lg-8 ">
                            <label>Annual Salary</label>

                            <div className="salary-row">

                                {/* Currency */}
                                <select
                                    className="chosen-single form-select salary-currency"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                >
                                    <option value="INR">INR</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                </select>

                                {/* Min Salary */}
                                <input
                                    type="number"
                                    value={minSalary}
                                    onChange={(e) => setMinSalary(e.target.value)}
                                    placeholder="Min Salary"
                                />

                                <span className="salary-label">to</span>

                                {/* Max Salary */}
                                <input
                                    type="number"
                                    value={maxSalary}
                                    onChange={(e) => setMaxSalary(e.target.value)}
                                    placeholder="Max Salary"
                                />

                                <span className="salary-label">Lacs</span>

                            </div>
                            <div className="location-options">
                                <label className="checkbox-option">
                                    <input
                                        type="checkbox"
                                        checked={remoteCandidates}
                                        onChange={(e) => setRemoteCandidates(e.target.checked)}
                                    />
                                    Include candidates who did not mention their current salary in their profile
                                </label>

                            </div>

                        </div>

                    </div>


                    <div className="row">
                        {/* Company */}
                        <div className="widget-title">
                            <h4>Employment Details</h4>
                            {/* <WidgetToFilterBox /> */}
                        </div>
                        {/* Department & Role */}

                        <div className="form-group col-lg-8 col-md-6">
                            <label>Department and Role</label>

                            <CreatableSelect
                                instanceId="department-role"
                                isMulti
                                options={departmentOptions}
                                value={selectedDepartments}
                                onChange={(selected) => setSelectedDepartments(selected || [])}
                                placeholder="Add Department / Role"
                                classNamePrefix="custom-select"
                                className="basic-multi-select"
                                closeMenuOnSelect={false}
                            />

                            <div className="suggestion-tags mt-3">
                                {departmentOptions.map((item) => (
                                    <span
                                        key={item.value}
                                        className="suggestion-tag"
                                        onClick={() => {
                                            if (!selectedDepartments.find(x => x.value === item.value)) {
                                                setSelectedDepartments([...selectedDepartments, item]);
                                            }
                                        }}
                                    >
                                        {item.label} +
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Industry */}

                        <div className="form-group col-lg-8 col-md-6">
                            <label>Industry</label>

                            <CreatableSelect
                                instanceId="industry"
                                isMulti
                                options={industryOptions}
                                value={selectedIndustries}
                                onChange={(selected) => setSelectedIndustries(selected || [])}
                                placeholder="Add Industry"
                                classNamePrefix="custom-select"
                                className="basic-multi-select"
                                closeMenuOnSelect={false}
                            />

                            <div className="suggestion-tags mt-3">
                                {industryOptions.map((item) => (
                                    <span
                                        key={item.value}
                                        className="suggestion-tag"
                                        onClick={() => {
                                            if (!selectedIndustries.find(x => x.value === item.value)) {
                                                setSelectedIndustries([...selectedIndustries, item]);
                                            }
                                        }}
                                    >
                                        {item.label} +
                                    </span>
                                ))}
                            </div>
                        </div>


                        <div className="form-group col-lg-12">
                            <label>
                                Company Type
                                <span
                                    style={{
                                        marginLeft: "6px",
                                        color: "#999",
                                        fontSize: "14px",
                                    }}
                                >
                                    ⓘ
                                </span>
                            </label>

                            <div className="company-type-tags ">

                                {companyTypeOptions.map((type) => (
                                    <button
                                        type="button"
                                        key={type}
                                        className={`company-type-tag ${selectedCompanyTypes.includes(type) ? "active" : ""
                                            }`}
                                        onClick={() => toggleCompanyType(type)}
                                    >
                                        {type}
                                        <span className="plus-icon">
                                            {selectedCompanyTypes.includes(type) ? "✓" : "+"}
                                        </span>
                                    </button>
                                ))}

                            </div>

                            <div className="form-group col-lg-6 col-md-6">
                                <label>Company</label>
                                <input type="text"
                                    value={company}
                                    placeholder="Add company name"
                                    onChange={(e) => setCompany(e.target.value)}
                                />
                            </div>

                            <div className="mt-3">
                                <select className="chosen-single form-select">
                                    <option>Search in Current company type</option>
                                    <option>Current Company</option>
                                    <option>Previous Company</option>
                                    <option>Both</option>
                                </select>
                            </div>
                        </div>


                        {/* Notice Period */}
                        <div className="form-group col-lg-12">
                            <label>Notice Period</label>

                            <div className="company-type-tags">
                                {noticePeriodOptions.map((period) => (
                                    <button
                                        type="button"
                                        key={period}
                                        className={`company-type-tag ${selectedNoticePeriods.includes(period) ? "active" : ""
                                            }`}
                                        onClick={() => toggleNoticePeriod(period)}
                                    >
                                        {period}

                                        <span className="plus-icon">
                                            {selectedNoticePeriods.includes(period) ? "✓" : "+"}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>


                    {/* Buttons */}

                    <div className="d-flex justify-content-end">
                        <div className="d-flex gap-3">


                            <button
                                type="button"
                                className="btn submit-btn"
                                onClick={clearFilters}
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                className="theme-btn btn-style-one"
                                onClick={handleSearch}
                            >
                                Search Candidates
                            </button>



                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default SearchFilterBox;