"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Select, { components } from "react-select";
import CreatableSelect from "react-select/creatable";
import AsyncCreatableSelect from "react-select/async-creatable";
import { toast } from "react-toastify";

import Link from "next/link";
import Image from "next/image";

const SearchFilterBox = () => {
    const router = useRouter();
    const [keywordInput, setKeywordInput] = useState("");
    const [keywords, setKeywords] = useState([]);
    const [currency, setCurrency] = useState("INR");
    const [mandatoryKeywords, setMandatoryKeywords] = useState(false);
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
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

    const [loading, setLoading] = useState(false);
    const [keywordOptions, setKeywordOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [industryOptions, setIndustryOptions] = useState([])
    const [locationOptions, setLocationOptions] = useState([])
    const [selectedNoticePeriods, setSelectedNoticePeriods] = useState([]);

    const [candidates, setCandidates] = useState([]);

    const [selectedSkillsList, setSelectedSkillsList] = useState();

    const getKeywordOptions = async (inputValue) => {
        try {
            const response = await fetch("/api/list-keywords", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    term: inputValue,
                    pageNo: 1
                }),
            });

            const data = await response.json();

            // const options = (data.data || []).map(x => ({
            //     key: x.key,
            //     value: x.value,        // unique id
            //     label: x.value       // text to display
            // }));
            const options = data.data.map((x, index) => ({
                key: x.key,
                value: `${x.key}_${x.type}`,   // unique
                label: x.value,
                text: x.type
            }));
            //console.log(options)
            return options || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    };


    const loadOptionsKeywords = (inputValue) => {
        if (!inputValue || inputValue.trim().length < 2) {
            return Promise.resolve([]);
        }
        return getKeywordOptions(inputValue);
    };


    const handleSearch = async () => {

        const appliedFilters = [
            selectedKeywords.length > 0,
            minExperience,
            maxExperience,
            minSalary,
            maxSalary,
            selectedLocations.length > 0,
            company?.trim(),
            selectedNoticePeriods.length > 0,
            selectedDepartments.length > 0,
            selectedIndustries.length > 0
        ].filter(Boolean).length;

        if (appliedFilters < 0) {

            toast.error("Please select at least 2 filters.");
            return;
        }
        // console.log('selectedKeywords ', JSON.stringify(selectedKeywords))
        // console.log('selectedNoticePeriods ', JSON.stringify(selectedNoticePeriods))

        const payload = {
            // Basic
            UQ_ID: null,
            JOB_POST_ID: 0,

            // Keywords (combined from all sources)
            KEYWORDS: selectedKeywords.map(x => x.label).join(",") || null,

            DESIGNATION: selectedKeywords
                .filter(x => x.value.endsWith("_Designation"))
                .map(x => x.label)
                .join(",") || null,

            SKILLS: selectedKeywords
                .filter(x => x.value.endsWith("_Skill"))
                .map(x => x.label)
                .join(",") || null,

            ROLES: selectedKeywords
                .filter(x => x.value.endsWith("_Role"))
                .map(x => x.label)
                .join(",") || null,

            // Experience
            MIN_EXPERIENCE: minExperience ? parseInt(minExperience) : 0,
            MAX_EXPERIENCE: maxExperience ? parseInt(maxExperience) : 0,

            // Salary
            MIN_SALARY: minSalary ? parseFloat(minSalary) : 0,
            MAX_SALARY: maxSalary ? parseFloat(maxSalary) : 0,
            CURRENT_SALARY_FROM: minSalary ? parseFloat(minSalary) : 0,
            CURRENT_SALARY_TO: maxSalary ? parseFloat(maxSalary) : 0,
            EXPECTED_SALARY_FROM: minSalary ? parseFloat(minSalary) : 0,
            EXPECTED_SALARY_TO: maxSalary ? parseFloat(maxSalary) : 0,

            // Location
            LOCATION: selectedLocations.map(k => k.label).join(",") || '',

            // Company & Designation
            COMPANY: company || '',
            //DESIGNATION: designation || null,

            // Notice Period (take first selected or join them)
            NOTICE_PERIOD: selectedNoticePeriods.join(",") || 'Any',

            // Optional - you can extend later
            DEPARTMENT_IDS: selectedDepartments.map(d => d.label).join(",") || '',
            INDUSTRY_IDS: selectedIndustries.map(i => i.label).join(",") || '',

            // Pagination
            PAGE_NO: 1,
            PAGE_SIZE: 20
        };
        //console.log('payload ', JSON.stringify(payload))

        // return;
        setLoading(true);
        try {

            const response = await fetch("/api/candidates-search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                //console.log("Candidates fetched:", data.data);



                if (payload?.SKILLS?.length > 0) {

                    const selectedSkills = (payload?.SKILLS || "")
                        .split(",")
                        .map(s => s.trim().toLowerCase());

                    setSelectedSkillsList(selectedSkills);
                }
                const searchState = {
                    payload,
                    results: data,
                };
                console.log(JSON.stringify(data?.data))
                setCandidates(data?.data);
                // const encodedState = encodeURIComponent(JSON.stringify(searchState));
                // router.push(`/employers-dashboard/candidates-search?searchData=${encodedState}`);

                // TODO: Send data to parent component or use Context/Redux
                // Example: onSearchResults(data.results, data.totalCount);
            } else {
                console.error("Search failed:", data);
            }
        } catch (error) {
            console.error("API Error:", error);
        } finally {
            setLoading(false);
        }
    };

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

    const getDepartmentOptions = async (inputValue) => {
        try {
            const response = await fetch("/api/list-department", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    term: inputValue,
                    pageNo: 1,
                }),
            });

            const data = await response.json();

            const options = (data.data || []).map(x => ({
                key: x.key,
                value: x.key,        // unique id
                label: x.value       // text to display
            }));

            setDepartmentOptions(options);


            return options || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const loadOptionsDepartment = (inputValue) => {
        if (!inputValue || inputValue.trim().length < 2) {
            return Promise.resolve([]);
        }
        return getDepartmentOptions(inputValue);
    };

    const getIndustryOptions = async (inputValue) => {
        try {
            const response = await fetch("/api/list-industry-search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    term: inputValue,
                    pageNo: 1
                }),
            });

            const data = await response.json();
            const options = (data.data || []).map(x => ({
                key: x.key,
                value: x.key,        // unique id
                label: x.value       // text to display
            }));

            setIndustryOptions(options);

            return options || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    };
    const loadOptionsIndustry = (inputValue) => {
        if (!inputValue || inputValue.trim().length < 2) {
            return Promise.resolve([]);
        }
        return getIndustryOptions(inputValue);
    };

    const getLocationOptions = async (inputValue) => {
        try {
            const response = await fetch("/api/list-location", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    term: inputValue,
                    pageNo: 1
                }),
            });

            const data = await response.json();
            const options = (data.data || []).map(x => ({
                key: x.key,
                value: x.key,        // unique id
                label: x.value       // text to display
            }));

            setLocationOptions(options);

            return options || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    };


    const loadOptionsLocation = (inputValue) => {
        if (!inputValue || inputValue.trim().length < 2) {
            return Promise.resolve([]);
        }
        return getLocationOptions(inputValue);
    };

    const companyTypeOptions = [
        "Indian MNC",
        "Foreign MNC",
        "Govt/PSU",
        "Startup",
        "Corporate",
    ];

    const noticePeriodOptions = [
        "Any",
        "Immediate joining",
        "Less than 15days",
        "Less than 30days",
        "Less than 60days",
        "Less than 90days",

    ];



    const Option = (props) => (
        <components.Option {...props}>


            {props.data.label}

            <span
                style={{
                    float: "right",
                    color: "#888",
                    fontSize: 12,
                }}
            >
                {props.data.text}

            </span>
        </components.Option>
    );

    const MultiValueLabel = (props) => (
        <components.MultiValueLabel {...props}>
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


            <div className="widget-content  ">
                <form className="default-form">
                    <div className="row">

                        {/* Keywords */}
                        <div className="form-group col-lg-12">
                            <label>Keywords</label>

                            <AsyncCreatableSelect
                                instanceId="candidate-keywords"
                                isMulti
                                cacheOptions
                                defaultOptions={[]}
                                loadOptions={loadOptionsKeywords}
                                value={selectedKeywords}
                                onChange={(selected) => setSelectedKeywords(selected || [])}

                                placeholder="Search skills, designation, role..."
                                classNamePrefix="custom-select"

                                components={{
                                    Option,
                                    MultiValueLabel,
                                }}
                                getOptionValue={(option) => option.value}
                                getOptionLabel={(option) => option.label}
                                closeMenuOnSelect={false}
                                hideSelectedOptions={false}
                                isValidNewOption={() => false}
                                noOptionsMessage={() => null}

                            />
                        </div>



                        {/* Experience */}

                        <div className="col-lg-4 col-md-6">
                            <label>Experience</label>

                            <div className="experience-wrapper">

                                <input
                                    type="number"
                                    value={minExperience}
                                    onChange={(e) => setMinExperience(e.target.value)}
                                    placeholder="Min experience in Years"
                                />

                                <span className="experience-text">to</span>

                                <input
                                    type="number"
                                    value={maxExperience}
                                    onChange={(e) => setMaxExperience(e.target.value)}
                                    placeholder="Max experience in Years"
                                />
                            </div>
                        </div>
                        {/* Salary */}
                        <div className="col-lg-4 col-md-6">
                            <label>Annual Salary</label>
                            <div className="salary-row">
                                {/* Currency */}
                                {/* <select
                                    className="chosen-single form-select salary-currency"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                >
                                    <option value="INR">INR</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                </select> */}

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
                            </div>
                            {/* <div className="location-options">
                                <label className="checkbox-option">
                                    <input
                                        type="checkbox"
                                        checked={remoteCandidates}
                                        onChange={(e) => setRemoteCandidates(e.target.checked)}
                                    />
                                    <span>   Include candidates who did not mention their current salary in their profile</span>
                                </label>
                            </div> */}
                        </div>

                        {/* Location */}

                        <div className="col-lg-4 col-md-6">
                            <label>Current location of candidate</label>

                            <AsyncCreatableSelect
                                instanceId="location"
                                isMulti
                                cacheOptions
                                defaultOptions={[]}
                                loadOptions={loadOptionsLocation}
                                value={selectedLocations}
                                onChange={(selected) => setSelectedLocations(selected || [])}

                                placeholder="Search Location"
                                classNamePrefix="custom-select"
                                // className="basic-multi-select"
                                closeMenuOnSelect={false}
                                hideSelectedOptions={false}
                                isValidNewOption={() => false}
                                noOptionsMessage={() => null}
                            />

                            {/* <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Current Location"
                            /> */}
                            {/* 
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
                                <span> Exclude candidate who have mentioned that they are open to remote work only</span>
                            </label>
                        </div> */}
                        </div>


                        {/* Department & Role */}


                        <div className="mt-3 mb-2" >
                            <h5>Employment Details</h5>
                        </div>

                        <div className="col-lg-6 col-md-6">

                            <label>Department and Role</label>

                            <AsyncCreatableSelect
                                instanceId="department-role"
                                isMulti
                                cacheOptions
                                defaultOptions={[]}
                                loadOptions={loadOptionsDepartment}
                                value={selectedDepartments}
                                onChange={(selected) => setSelectedDepartments(selected || [])}

                                placeholder="Search Department / Role"
                                classNamePrefix="custom-select"
                                //className="basic-multi-select"
                                closeMenuOnSelect={false}
                                hideSelectedOptions={false}
                                isValidNewOption={() => false}
                                noOptionsMessage={() => null}
                            />

                            {/* <div className="suggestion-tags mt-3">
                                    <div className="suggestion-tags mt-3">
                                        {departmentOptions.map((item) => (
                                            <span
                                                key={item.key}
                                                className="suggestion-tag"
                                                onClick={() => {
                                                    if (!selectedDepartments.some(x => x.key === item.key)) {
                                                        setSelectedDepartments(prev => [...prev, item]);
                                                    }
                                                }}
                                            >
                                                {item.value} +
                                            </span>
                                        ))}
                                    </div>
                                </div> */}
                        </div>


                        {/* Industry */}

                        <div className="col-lg-6 col-md-6">
                            <label>Industry</label>

                            <AsyncCreatableSelect
                                instanceId="industry"
                                isMulti
                                cacheOptions
                                defaultOptions={[]}
                                loadOptions={loadOptionsIndustry}
                                value={selectedIndustries}
                                onChange={(selected) => setSelectedIndustries(selected || [])}

                                placeholder="Search Industry"
                                classNamePrefix="custom-select"
                                //className="basic-multi-select"
                                closeMenuOnSelect={false}
                                hideSelectedOptions={false}
                                isValidNewOption={() => false}
                                noOptionsMessage={() => null}
                            />
                            {/* <div className="suggestion-tags mt-3">
                                    {industryOptions.map((item) => (
                                        <span
                                            key={item.key}
                                            className="suggestion-tag"
                                            onClick={() => {
                                                if (!selectedIndustries.find(x => x.key === item.key)) {
                                                    setSelectedIndustries([...selectedIndustries, item]);
                                                }
                                            }}
                                        >
                                            {item.value} +
                                        </span>
                                    ))}
                                </div> */}
                        </div>


                        {/* <div className="form-group col-lg-12">
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
                        </div> */}


                        {/* Notice Period */}
                        <div className="col-lg-12 col-md-12">
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



                        {/* Buttons */}

                        <div className="d-flex justify-content-between justify-content-md-end" >
                            <div className="d-flex gap-1">


                                <button
                                    type="button"
                                    className="btn submit-btn"
                                    style={{ background: "#797a7e" }}
                                    onClick={clearFilters}
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    className="btn submit-btn"
                                    onClick={handleSearch}
                                    disabled={loading}
                                >
                                    {loading ? "Searching..." : "Search Candidates"}
                                </button>


                            </div>
                        </div>

                    </div>
                </form>

                {

                    candidates?.length > 0 &&

                    candidates?.map((candidate) => (
                        <div className="mt-3" key={candidate.candiUqId}>
                            <div className="na-card">
                                {/* Left Section */}
                                <div className="na-left">

                                    <div className="">

                                        <div className="candidate-top">
                                            <div className="candidate-checkbox">
                                                <input
                                                    type="checkbox"
                                                    className="check-input"
                                                    id={`candidate-${candidate.candiUqId}`}
                                                // checked={selectedCandidates.includes(candidate.id)}
                                                // onChange={(e) => {
                                                //     if (e.target.checked) {
                                                //         setSelectedCandidates(prev => [...prev, candidate.id]);
                                                //     } else {
                                                //         setSelectedCandidates(prev =>
                                                //             prev.filter(id => id !== candidate.id)
                                                //         );
                                                //     }
                                                // }}
                                                />
                                            </div>

                                            <div className="candidate-basic">
                                                <h4>
                                                    <Link href={`/candidates-single-v1/${candidate.candiUqId}`}>
                                                        {candidate.candiName}
                                                    </Link>
                                                </h4>

                                                <div className="top-meta">
                                                    <span>
                                                        <i className="flaticon-briefcase"></i>
                                                        {" "}   {candidate.experience}
                                                    </span>

                                                    <span>
                                                        <i className="flaticon-money"></i>
                                                        {" "}  &#8377;  {candidate.curentSalary}
                                                    </span>

                                                    <span>
                                                        <i className="flaticon-map-locator"></i>
                                                        {" "}   {candidate.city}, {candidate.state}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="candidate-row">
                                        <div className="label1">Current</div>
                                        <div className="value">
                                            {candidate.currentCompany}
                                            {/* <strong>{candidate.currentCompany}</strong> */}
                                        </div>
                                    </div>

                                    {/* <div className="candidate-row">
                                        <div className="label1">Previous</div>
                                        <div className="value">
                                            {candidate.previousDesignation} at{" "}
                                            <strong>{candidate.previousCompany}</strong>
                                        </div>
                                    </div> */}

                                    <div className="candidate-row">
                                        <div className="label1">Education</div>

                                        <div className="value">
                                            {candidate.education}

                                            {/* {candidate.education.map((edu, index) => (
                                            <div key={index}>{edu}</div>
                                        ))} */}
                                        </div>
                                    </div>

                                    <div className="candidate-row">
                                        <div className="label1">Pref. Location</div>
                                        <div className="value">
                                            {candidate.workingLocation}
                                        </div>
                                    </div>
                                    <div className="candidate-row">
                                        <div className="label1">Notice Period</div>
                                        <div className="value">
                                            {candidate.noticePeriod}
                                        </div>
                                    </div>


                                    <div className="candidate-row skills-row">
                                        <div className="label1">Key Skills</div>
                                        <div className="value">
                                            {(candidate.skills || "")
                                                .split(",")
                                                .filter(Boolean)
                                                .map((skill, index) => {
                                                    const trimmedSkill = skill.trim();

                                                    const isSelected = (selectedSkillsList || "")
                                                        .toLowerCase()
                                                        .split(",")
                                                        .map(s => s.trim())
                                                        .includes(trimmedSkill.toLowerCase());

                                                    return (
                                                        <span
                                                            key={index}
                                                            className={isSelected ? "skill-pill" : ""}
                                                        >
                                                            {trimmedSkill} {" "}
                                                        </span>
                                                    );
                                                })}
                                        </div>
                                    </div>

                                </div>

                                {/* Right Section */}

                                <div className="na-right">

                                    <div className="profile-image">
                                        <Image
                                            src={candidate.avatar ?? ""}
                                            width={90}
                                            height={90}
                                            alt=""
                                        />
                                    </div>
                                    <div className="profile-section">
                                        <div className="candidate-side-actions">
                                            <button className="action-icon-btn">
                                                <i className="las la-comment"></i>
                                            </button>

                                            <button className="action-icon-btn">
                                                <i className="lar la-bookmark"></i>
                                            </button>

                                            <button className="action-icon-btn">
                                                <i className="las la-paper-plane"></i>
                                            </button>

                                            <button className="action-icon-btn">
                                                <i className="las la-folder-plus"></i>
                                            </button>

                                            <button className="action-icon-btn">
                                                <i className="las la-bell"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <p className="profile-summary">
                                        {candidate.profileDesc}
                                    </p>

                                    <div className="candidate-action-buttons">
                                        <Link
                                            href={`/candidates-single-v1/${candidate.candiUqId}`}
                                            className="theme-btn btn-style-one w-100 butn"
                                        >
                                            View Profile
                                        </Link>

                                        <button className="theme-btn btn-style-one w-100 butn">
                                            Call Candidate
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))

                }

            </div>
        </div>

    );
};

export default SearchFilterBox;