'use client'
import { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { useRef } from "react";
import { toast } from 'react-toastify';

const InternshipForm = ({ data, setData, onNext }) => {
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [errors, setErrors] = useState({});
    const dropdownRef = useRef(null);
    const [form, setForm] = useState({

        company: "",
        projectName: "",
        projectUrl: "",
        skillsLearned: [],
        startYear: "",
        startMonth: "",
        endYear: "",
        endMonth: "",
        currentlyWorking: false,
        description: ""
    });

    const [list, setList] = useState(data.internships || []);
    const [skillOptions, setSkillOptions] = useState([]);
    const formRef = useRef(null);
    const currentYear = new Date().getFullYear();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getInternshipDetails();
    }, []);

    const getInternshipDetails = async () => {
        try {
            const response = await fetch("/api/candi-internship", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            const result = await response.json();
            const profile = result?.data;
            if (profile) {
                const item = profile[0];
                const keys = item.skillsIds.split("^");
                const values = item.skills.split("^");

                const skillsLearn = keys.map((k, index) => ({
                    key: Number(k),
                    value: values[index]
                }));

                const internList = {
                    company: item.companyName,
                    projectName: item.projectName,
                    projectUrl: item.projectUrl,
                    skillsLearned: skillsLearn,
                    startYear: item.fromYear,
                    startMonth: item.fromMonth,
                    endYear: item.toYear,
                    endMonth: item.toMonth,

                    currentlyWorking: item.currentCompany === "True" ? true : false,
                    description: item.workProfile
                };
                setForm(internList);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    };


    const months = [
        { key: 1, value: "January" },
        { key: 2, value: "February" },
        { key: 3, value: "March" },
        { key: 4, value: "April" },
        { key: 5, value: "May" },
        { key: 6, value: "June" },
        { key: 7, value: "July" },
        { key: 8, value: "August" },
        { key: 9, value: "September" },
        { key: 10, value: "October" },
        { key: 11, value: "November" },
        { key: 12, value: "December" }
    ];


    const [input, setInput] = useState("");
    const [skills, setSkills] = useState(form.skillsLearned || []);
    const [suggestions, setSuggestions] = useState([]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInput(value);

        const filtered = skillOptions.filter(
            (skill) =>
                skill.value.toLowerCase().includes(value.toLowerCase()) &&
                !form.skillsLearned.some((s) => s.key === skill.key)
        );

        setSuggestions(filtered);
    };

    const selectSkill = (id, value) => {
        if (!form.skillsLearned.some((s) => s.key === id)) {
            setForm((prev) => ({
                ...prev,
                skillsLearned: [
                    ...prev.skillsLearned,
                    {
                        key: id,
                        value: value,
                    },
                ],
            }));
        }

        setInput("");
        setSuggestions([]);
    };

    const removeSkill = (id) => {
        const updatedSkills = skills.filter((_, i) => i !== index);
        setSkills(updatedSkills);
        setForm((prev) => ({
            ...prev,
            skillsLearned: prev.skillsLearned.filter(
                (skill) => skill.key !== id
            ),
        }));
    };

    const getSkills = async () => {


        try {

            const response = await fetch("/api/list-skills", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    term: '',
                }),
            });

            const data = await response.json();
            //console.log("exam fetched:", JSON.stringify(data.data));

            setSkillOptions(data && data.data ? data.data : []);

        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        getSkills();
    }, [0]);



    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    };



    // RESET
    const resetForm = () => {
        setForm({
            profile: "",
            company: "",
            projectName: "",
            projectUrl: "",
            skillsLearned: [],
            startYear: "",
            startMonth: "",
            endYear: "",
            endMonth: "",
            currentlyWorking: false,
            description: ""
        });
    };


    const saveInternShip = async () => {
        let newErrors = {};

        if (!form.company?.trim() || form.company.length < 3) {
            newErrors.company = "Enter valid company name";
        }
        if (!form.projectName?.trim() || form.projectName.length < 3) {
            newErrors.projectName = "Enter valid project name";
        }
        if (!form.startMonth?.trim() || form.startMonth.length < 1) {
            newErrors.startMonth = "Select start month";
        }
        if (!form.startYear?.trim() || form.startYear.length < 4) {
            newErrors.startYear = "Select start year";
        }

        if (!form.currentlyWorking) {
            if (!form.endMonth?.trim() || form.endMonth.length < 1) {
                newErrors.endMonth = "Select end month";
            }
            if (!form.endYear?.trim() || form.endYear.length < 4) {
                newErrors.endYear = "Select end year";
            }
        }

        if (!form.skillsLearned || form.skillsLearned.length < 2) {
            newErrors.skillsLearned = "Enter your skills";
        }
        if (!form.description?.trim() || form.description.length < 20) {
            newErrors.description = "Enter your internship experience";
        }

        setErrors(newErrors);


        if (Object.keys(newErrors).length === 0) {

            try {

                setLoading(true);

                const res = await fetch("/api/candi-internship", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...form,
                    }),
                });

                const user = await res.json();
                console.log("Response from /api/candi-internship:", user);

                if (!res.ok) {
                    toast.error(user.message || "Update failed");
                    setLoading(false);
                    return;
                }
                resetForm();
                getInternshipDetails();
                toast.success(user.message);
            } catch (error) {
                console.error(error);
                toast.error("Save  failed. Please try again.");
            } finally {
                setLoading(false);
            }

        }
    };

    // SAVE & NEXT
    const handleSubmit = (e) => {
        e.preventDefault();

        setData({
            ...data,
            internships: list
        });

        onNext();
    };

    return (
        <form ref={formRef} className="default-form internship-form" onSubmit={handleSubmit} >

            {/* HEADER */}
            <div className="form-header">
                <h4>Internships</h4>
                <p>Add your internship experience to strengthen your profile</p>
            </div>

            <div className="row">
                <div className="exam-form-box">

                    {/* COMPANY */}
                    <div className="form-group col-lg-12">
                        <label>Company Name</label>
                        <input
                            type="text"
                            name="company"
                            value={form.company}
                            onChange={handleChange}
                            placeholder="Enter Company Name"
                        />
                        {errors.company && (
                            <span className="error-text">{errors.company}</span>
                        )}
                    </div>

                    <div className="form-group col-lg-12">
                        <label>Project Name</label>
                        <input
                            type="text"
                            name="projectName"
                            value={form.projectName}
                            onChange={handleChange}
                            placeholder="e.g. E-commerce Website, CRM System"
                        />
                        {errors.projectName && (
                            <span className="error-text">{errors.projectName}</span>
                        )}
                    </div>
                    {/* START YEAR */}
                    <div className="form-group col-12">
                        <label>Internship Duration</label>

                        <div className="duration-row">
                            <div className="">
                                {/* START MONTH */}
                                <select
                                    name="startMonth"
                                    value={form.startMonth || ""}
                                    onChange={handleChange}
                                >
                                    <option value="">Month</option>
                                    {months.map((m, index) => (
                                        <option key={index} value={m.key} >{m.value}</option>
                                    ))}
                                </select>
                                {errors.startMonth && (
                                    <span className="error-text">{errors.startMonth}</span>
                                )}
                            </div>
                            <div className="">
                                {/* START YEAR */}
                                <select
                                    name="startYear"
                                    value={form.startYear || ""}
                                    onChange={handleChange}
                                >
                                    <option value="">Year</option>
                                    {Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i)
                                        .map((year) => (
                                            <option key={year}>{year}</option>
                                        ))}
                                </select>
                                {errors.startYear && (
                                    <span className="error-text">{errors.startYear}</span>
                                )}
                            </div>

                            <span className="to-text">to</span>

                            {/* END MONTH */}
                            {form.currentlyWorking ? (
                                <div>
                                    <input value="Present" disabled style={{ width: "100%" }} />
                                    <p></p>
                                </div>
                            ) : (
                                <div>
                                    <select
                                        name="endMonth"
                                        value={form.endMonth || ""}
                                        onChange={handleChange}
                                    >
                                        <option value="">Month</option>
                                        {months.map((m, index) => (
                                            <option key={index} value={m.key} >{m.value}</option>
                                        ))}
                                    </select>
                                    {errors.endMonth && (
                                        <span className="error-text">{errors.endMonth}</span>
                                    )}
                                </div>
                            )}

                            {/* END YEAR */}
                            {form.currentlyWorking ? (
                                <div>
                                    <input value="Present" disabled style={{ width: "100%" }} />
                                    <p></p>
                                </div>
                            ) : (
                                <div>
                                    <select
                                        name="endYear"
                                        value={form.endYear || ""}
                                        onChange={handleChange}
                                    >
                                        <option value="">Year</option>
                                        {Array.from(
                                            {
                                                length: form.endYear
                                                    ? currentYear - form.startYear + 1
                                                    : currentYear - 1999
                                            },
                                            (_, i) =>
                                                form.startYear ? (parseInt(form.startYear) + i) : 2000 + i
                                        ).map((year) => (
                                            <option key={year}>{year}</option>
                                        ))}
                                    </select>
                                    {errors.endYear && (
                                        <span className="error-text">{errors.endYear}</span>
                                    )}
                                </div>
                            )}

                        </div>

                        {/* CHECKBOX */}
                        <div className="mt-2">
                            <label className="d-flex align-items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="currentlyWorking"
                                    checked={form.currentlyWorking}
                                    onChange={handleChange}
                                />
                                Currently Working Here
                            </label>
                        </div>
                    </div>



                    {/* DESCRIPTION */}
                    <div className="form-group col-12">
                        <label>Internship Experience</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className="about-input-company"
                            placeholder="Add details about projects and techniques you have learned during internship"
                        />
                        {errors.description && (
                            <span className="error-text">{errors.description}</span>
                        )}
                    </div>


                    {/* SKILLS */}
                    <div className="form-group col-12">
                        <label>Skills</label>

                        {/* Selected Skills */}
                        {form.skillsLearned.length > 0 && (
                            <div className="skill-tags mb-2">
                                {form.skillsLearned.map((skill) => (
                                    <div key={skill.key} className="skill-chip">
                                        {skill.value}
                                        <MdClose onClick={() => removeSkill(skill.key)} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Search Field */}

                        <div className="skill-input-box" ref={dropdownRef}>
                            <input
                                type="text"
                                placeholder="Search skills..."
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                            />

                            {suggestions.length > 0 && (
                                <ul className="skill-dropdown">
                                    {suggestions.map((skill) => (
                                        <li
                                            key={skill.key}
                                            onClick={() => selectSkill(skill.key, skill.value)}
                                        >
                                            {skill.value}
                                        </li>
                                    ))}
                                </ul>
                            )}


                        </div>
                        {errors.skillsLearned && (
                            <span className="error-text">{errors.skillsLearned}</span>
                        )}
                    </div>

                    <div className="form-group col-lg-12">
                        <label>
                            Project URL <span className="optional-text">(optional)</span>
                        </label>
                        <input
                            type="url"
                            name="projectUrl"
                            value={form.projectUrl}
                            onChange={handleChange}
                            placeholder="your project url"
                        />
                    </div>

                </div>

                <div className="mt-3">

                    <button
                        type="button"
                        className="btn btn-md btn-primary  me-3"
                        onClick={() => saveInternShip()}
                        disabled={loading}
                    >
                        {loading ? "Saving....." : "Save"}
                    </button>

                </div>
            </div>

            {/* SAVE */}
            <div className="text-end mt-3">
                <button type="submit" className="theme-btn btn-style-one"

                >
                    Next
                </button>
            </div>

        </form>
    );
};

export default InternshipForm;