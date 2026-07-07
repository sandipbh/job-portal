'use client'
import { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useRef } from "react";
import { MdClose } from "react-icons/md";
import { toast } from 'react-toastify';


const Project = ({ data, setData, onNext }) => {

    const emptyProject = {
        projectName: "",
        projectUrl: "",
        description: "",
        skills: [],
        projectStartMonth: "",
        projectStartYear: "",
        projectEndMonth: "",
        projectEndYear: "",
        currentlyWorking: true,
    };


    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(emptyProject);
    const [list, setList] = useState(data.projects || []);
    const [showForm, setShowForm] = useState(
        (data.projects || []).length === 0
    );
    const [editIndex, setEditIndex] = useState(null);
    const formRef = useRef(null);
    const dropdownRef = useRef(null);
    const [skillOptions, setSkillOptions] = useState([]);



    useEffect(() => {
        getExperienceDetails();
    }, []);

    const getSkillList = (skillsIds, skills) => {
        const keys = skillsIds.split("^");
        const values = skills.split("^");

        const skillsLearn = keys.map((k, index) => ({
            key: Number(k),
            value: values[index]
        }));
        return skillsLearn;
    }
    const getExperienceDetails = async () => {
        try {
            const response = await fetch("/api/candi-project", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            const result = await response.json();

            const profile = result?.data;

            if (profile) {
                const projectList = profile.map(item => ({

                    projectName: item.projectName,
                    projectUrl: item.projectUrl,
                    description: item.projectDetails,
                    skills: getSkillList(item.skillsIds, item.skills),
                    projectStartMonth: item.fromMonth,
                    projectStartYear: item.fromYear,
                    projectEndMonth: item.toMonth,
                    projectEndYear: item.toYear,
                    currentlyWorking: item.currentCompany,

                }));
                setList(projectList);

                setEditIndex(null);
                setShowForm(false);
            }
        } catch (error) {
            console.error(error);
        }
    };


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const [errors, setErrors] = useState({});
    const validateForm = () => {
        let newErrors = {};

        if (!form.projectName.trim()) {
            newErrors.projectName = "Project name is required";
        }

        if (!form.projectStartMonth || form.projectStartMonth < 1) {
            newErrors.projectStartMonth = "Select start month";
        }

        if (!form.projectStartYear || form.projectStartYear.length < 4) {
            newErrors.projectStartYear = "Select start year";
        }

        if (!form.currentlyWorking) {
            if (!form.projectEndMonth || form.projectEndMonth < 1) {
                newErrors.projectEndMonth = "Select end month";
            }

            if (!form.projectEndYear || form.projectEndYear.length < 4) {
                newErrors.projectEndYear = "Select end year";
            }
        }

        if (!form.description.trim() || form.description.length < 10) {
            newErrors.description = "Project description is required";
        }

        if (!form.skills || form.skills.length < 2) {
            newErrors.skills = "Enter your skills";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const saveProjects = async () => {
        const isValid = validateForm();

        if (!isValid) {
            return;
        }
        else {

            try {

                setLoading(true);

                const res = await fetch("/api/candi-project", {
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

                /******************* */
                let updated;

                if (editIndex !== null) {
                    updated = [...list];
                    updated[editIndex] = form;

                    setEditIndex(null);
                } else {
                    updated = [...list, form];
                }

                setList(updated);

                setData((prev) => ({
                    ...prev,
                    projects: updated
                }));

                setForm(emptyProject);

                setSkills([]);

                setShowForm(false);

                /*********************** */


                toast.success(user.message);
            } catch (error) {
                console.error(error);
                toast.error("Save  failed. Please try again.");
            } finally {
                setLoading(false);
            }

        }






    };

    const handleCancel = () => {
        setForm(emptyProject);
        setSkills([]);
        setEditIndex(null);
        setShowForm(false);
    };

    const handleAdd = () => {

        if (!form.projectName || !form.description) return;

        if (editIndex !== null) {
            const updated = [...list];
            updated[editIndex] = form;
            setList(updated);
            setEditIndex(null);
            showToast("Project updated successfully");
        } else {
            setList([...list, form]);
            showToast("Project added successfully");
        }

        resetForm();
    };
    const handleEdit = (index) => {
        setForm({ ...list[index] });

        setSkills(list[index].skills || []);

        setEditIndex(index);

        setShowForm(true);
    };


    const resetForm = () => {
        setForm(emptyForm);
        setSkillInput("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setData({
            ...data,
            projects: list
        });

        onNext();
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
    const [skills, setSkills] = useState(form.skills || []);
    const [suggestions, setSuggestions] = useState([]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInput(value);

        const filtered = skillOptions.filter(
            (skill) =>
                skill.value.toLowerCase().includes(value.toLowerCase()) &&
                !form.skills.some((s) => s.key === skill.key)
        );

        setSuggestions(filtered);
    };

    const selectSkill = (id, value) => {
        if (!form.skills.some((s) => s.key === id)) {
            setForm((prev) => ({
                ...prev,
                skills: [
                    ...prev.skills,
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
            skills: prev.skills.filter(
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
            // console.log("exam fetched:", JSON.stringify(data.data));

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

    const currentYear = new Date().getFullYear();





    return (
        <form ref={formRef} className="default-form project-form" onSubmit={handleSubmit}>

            {/* HEADER */}
            <div className="form-header">
                <h4>Projects</h4>
                <p>Add your personal / professional projects</p>
            </div>

            {!showForm && (
                <button
                    type="button"
                    className="btn btn-sm btn-info mb-4"
                    onClick={() => {
                        setForm(emptyProject);
                        setSkills([]);
                        setEditIndex(null);
                        setShowForm(true);
                    }}
                >
                    + Add Project
                </button>
            )}

            {list.map((item, index) => (
                <div key={index} className="exam-card">

                    < div className="d-flex justify-content-between" >

                        <div>
                            <h5>{item.projectName}</h5>

                            <p className="mb-1">
                                {item.projectStartMonth} {item.projectStartYear}
                                {" - "}
                                {item.currentlyWorking
                                    ? "Present"
                                    : `${item.projectEndMonth} ${item.projectEndYear}`}
                            </p>

                            {item.projectUrl && (
                                <p>{item.projectUrl}</p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => handleEdit(index)}
                        >
                            ✏️
                        </button>

                    </div>
                </div >
            ))}

            {
                showForm && (
                    <>
                        <div className="exam-form-box">
                            <div className="row">

                                {/* PROJECT NAME */}
                                <div className="form-group col-lg-12">
                                    <label>Project Name</label>
                                    <input
                                        type="text"
                                        name="projectName"
                                        value={form.projectName}
                                        onChange={handleChange}
                                        placeholder="E-commerce Website"
                                    />
                                    {errors.projectName && (
                                        <span className="error-text">{errors.projectName}</span>
                                    )}
                                </div>

                                {/* WORKING SINCE */}
                                <div className="form-group col-12 mt-2">
                                    <label>Working Since</label>

                                    {/* START DATE */}
                                    <div className="row">
                                        <div className="form-group col-lg-6 col-md-6">
                                            <label>Start Month</label>
                                            <select
                                                name="projectStartMonth"
                                                value={form.projectStartMonth || ""}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select Month</option>
                                                {months.map((m, index) => (
                                                    <option key={index} value={m.key} >{m.value}</option>
                                                ))}
                                            </select>

                                            {errors.projectStartMonth && (
                                                <span className="error-text">
                                                    {errors.projectStartMonth}
                                                </span>
                                            )}
                                        </div>

                                        <div className="form-group col-lg-6 col-md-6">
                                            <label>Start Year</label>
                                            <select
                                                name="projectStartYear"
                                                value={form.projectStartYear || ""}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select Year</option>

                                                {Array.from(
                                                    { length: currentYear - 1999 },
                                                    (_, i) => currentYear - i
                                                ).map((year) => (
                                                    <option key={year} value={year}>
                                                        {year}
                                                    </option>
                                                ))}
                                            </select>

                                            {errors.projectStartYear && (
                                                <span className="error-text">
                                                    {errors.projectStartYear}
                                                </span>
                                            )}
                                        </div>
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
                                    {/* END DATE */}
                                    {!form.currentlyWorking && (
                                        <div className="row">
                                            <div className="form-group col-lg-6 col-md-6">
                                                <label>End Month</label>

                                                <select
                                                    name="projectEndMonth"
                                                    value={form.projectEndMonth || ""}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select Month</option>

                                                    {months.map((m, index) => (
                                                        <option key={index} value={m.key} >{m.value}</option>
                                                    ))}
                                                </select>

                                                {errors.projectEndMonth && (
                                                    <span className="error-text">
                                                        {errors.projectEndMonth}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="form-group col-lg-6 col-md-6">
                                                <label>End Year</label>

                                                <select
                                                    name="projectEndYear"
                                                    value={form.projectEndYear || ""}
                                                    onChange={handleChange}
                                                    disabled={!form.projectStartYear}
                                                >
                                                    <option value="">Select Year</option>

                                                    {form.projectStartYear &&
                                                        Array.from(
                                                            {
                                                                length:
                                                                    currentYear -
                                                                    Number(form.projectStartYear) +
                                                                    1,
                                                            },
                                                            (_, i) =>
                                                                Number(form.projectStartYear) + i
                                                        ).map((year) => (
                                                            <option key={year} value={year}>
                                                                {year}
                                                            </option>
                                                        ))}
                                                </select>

                                                {errors.projectEndYear && (
                                                    <span className="error-text">
                                                        {errors.projectEndYear}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* PRESENT */}

                                </div>

                                {/* DESCRIPTION */}
                                <div className="form-group col-12">
                                    <label>Project Description</label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        className="about-input-company"
                                        rows={4}
                                        placeholder="Add details about projects and techniques you have learned during project"
                                    />
                                    {errors.description && (
                                        <span className="error-text">{errors.description}</span>
                                    )}
                                </div>

                                {/* SKILLS */}
                                <div className="form-group col-12">
                                    <label>Skills Developed</label>

                                    {/* Selected Skills */}
                                    {form.skills.length > 0 && (
                                        <div className="skill-tags mb-2">
                                            {form.skills.map((skill) => (
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
                                    {errors.skills && (
                                        <span className="error-text">{errors.skills}</span>
                                    )}
                                </div>

                                {/* SKILLS */}


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
                                <div className="d-flex gap-3 mt-4">



                                    <button
                                        type="button"
                                        className="btn btn-md btn-primary  me-3"
                                        onClick={() => saveProjects()}
                                        disabled={loading}
                                    >
                                        {loading ? "Saving....." : "Save"}
                                    </button>


                                    <button
                                        type="button"
                                        className="btn btn-md btn-secondary"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>

                                </div>
                            </div>
                        </div>
                    </>
                )
            }

            {/* SAVE */}
            <div className="text-end mt-5">
                <button
                    type="submit"
                    className="theme-btn btn-style-one"
                >
                    Save & Continue
                </button>
            </div>
        </form >
    );
};

export default Project;