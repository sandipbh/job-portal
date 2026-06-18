
'use client'

import Map from "../../../Map";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { useState } from "react";
import JobDescriptionBox from "./JobDescriptionBox";
import { FaMale, FaFemale, FaUsers } from "react-icons/fa";
import { FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import { MdOutlineContactPhone } from "react-icons/md";

const PostBoxForm = ({ activeTab, setActiveTab }) => {
  const handleSubmit = () => {
    console.log("Form Submitted");
  };
  const incentives = [
    { value: "Food Allowance", label: "Food Allowance" },
    { value: "Health Coverage", label: "Health Coverage" },
    { value: "Insurance", label: "Insurance" },
    { value: "Annual Bonus", label: "Annual Bonus" },
    { value: "Management", label: "Management" },
    { value: "Work Flexibility", label: "Work Flexibility" },
    { value: "Office cab/shuttle", label: "Office cab/shuttle" },
    { value: "Provident Fund", label: "Provident Fund" },
  ];

  const skills = [
    { value: "Java", label: "Java" },
    { value: "JavaScript", label: "JavaScript" },
    { value: "Python", label: "Python" },
    { value: "React", label: "React" },
    { value: "Node.js", label: "Node.js" },
    { value: "MongoDB", label: "MongoDB" },
    { value: "Full Stack Developer", label: "Full Stack Developer" },
    { value: "Other", label: "Other" },
  ];

  const degree = [
    { value: "B.Tech", label: "B.Tech" },
    { value: "BCA", label: "BCA" },
    { value: "BSc-It", label: "BSc-It" },
    { value: "M.Tech", label: "M.Tech" },
    { value: "PhD", label: "PhD" },
  ];

  const industry = [
    {
      label: "IT Services",
      options: [
        { value: "software_dev", label: "Software Development" },
        { value: "web_dev", label: "Web Development" },
        { value: "cloud", label: "Cloud Computing" },
        { value: "cyber_security", label: "Cyber Security" },
      ],
    },
    {
      label: "BPM",
      options: [
        { value: "customer_support", label: "Customer Support" },
        { value: "bpo", label: "BPO Operations" },
        { value: "data_entry", label: "Data Entry" },
      ],
    },
    {
      label: "Finance",
      options: [
        { value: "accounting", label: "Accounting" },
        { value: "auditing", label: "Auditing" },
      ],
    },
  ];

  const languages = [
    { value: "English", label: "English" },
    { value: "Hindi", label: "Hindi" },
    { value: "Marathi", label: "Marathi" },
    { value: "Telugu", label: "Telugu" },
    { value: " Kannada", label: "Kannada" },
    { value: " Malayalam", label: "Malayalam" },
    { value: "Other", label: "Other" },

  ];

  const [questions, setQuestions] = useState([
    {
      question: "",
      type: "text",
      required: true,
      options: [],
    },
  ]);

  const suggestedQuestions = [
    {
      question: "What's your current salary?",
      type: "text",
    },
    {
      question: "What's your expected salary?",
      type: "text",
    },
    {
      question: "What's your notice period?",
      type: "text",
    },
    {
      question: "Are you comfortable with English?",
      type: "yesno",
    },
    {
      question: "Are you willing to attend in-person interview?",
      type: "yesno",
    },
  ];


  const handleNext = () => {
    console.log("Current Tab:", activeTab);
    console.log("Job Description State:", jobDesc);

    // Screening Questions
    if (activeTab === 2) {
      if (!validateQuestions()) {
        return;
      }
    }

    // Job Description
    if (activeTab === 3) {
      if (!validateJobDescription()) {
        return;
      }
    }

    setActiveTab(activeTab + 1);
  };

  const [jobDesc, setJobDesc] = useState("");

  const [selectedDays, setSelectedDays] = useState([]);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];


  {/* STAR IN ADD SKILL*/ }
  const [selectedSkills, setSelectedSkills] = useState([]);

  const CustomMultiValueLabel = (props) => {
    const { data, selectProps } = props;

    const toggleStar = () => {
      const updated = selectProps.value.map((item) => {
        if (item.value === data.value) {
          return { ...item, starred: !item.starred };
        }
        return item;
      });

      selectProps.onChange(updated);
    };

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>

        <span
          onClick={toggleStar}
          style={{
            cursor: "pointer",
            color: data.starred ? "#1967d2" : "#ccc", // blue when active
            fontSize: "20px"
          }}
        >
          ★
        </span>

        {/* Skill Name */}
        <span>{data.label}</span>
      </div>
    );
  };
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    minExperience: "",
    maxExperience: "",
    fresherAllowed: false,
    jobType: "",
    minSalary: "",
    maxSalary: "",

    //  step 2 fields
    department: "",
    jobRole: "",
    jobLocation: "",
    skills: [],
    qualification: "",
    industry: [],
    gender: "",
  });
  const [contactData, setContactData] = useState({
    contactMethod: "",
    email: "",
    phone: "",
    callFrom: "",
    callTo: "",
    applicationMethod: "",
    externalLink: "",
    allowDirectCall: "",
  });
  const callOptions = [
    { label: "Yes" },
    { label: "No" },
  ];

  const contactMethods = [
    {
      label: "Email",
      icon: <FaEnvelope />,
    },
    {
      label: "Phone",
      icon: <FaPhoneAlt />,
    },
    {
      label: "Both",
      icon: <MdOutlineContactPhone />,
    },
  ];

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "minExperience") {
      setFormData((prev) => ({
        ...prev,
        minExperience: value,
        maxExperience: "",
      }));
      return;
    }

    if (name === "minSalary") {
      setFormData((prev) => ({
        ...prev,
        minSalary: value,
        maxSalary:
          Number(prev.maxSalary) <= Number(value)
            ? ""
            : prev.maxSalary,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };


  const handleContactChange = (e) => {
    const { name, value } = e.target;

    setContactData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };


  const updateQuestions = (updatedQuestions) => {
    setQuestions(updatedQuestions);

    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions.map((q) => ({
        question: q.question,
        type: q.type,
        required: q.required ? 1 : 0,
        options: q.options || [],
      })),
    }));
    console.log(updatedQuestions);
  };

  const validateQuestions = () => {
    const newErrors = {};

    questions.forEach((q, index) => {
      if (!q.question.trim()) {
        newErrors[`question_${index}`] =
          "Question is required";
      }

      if (q.type === "options") {
        q.options.forEach((opt, i) => {
          if (!opt.trim()) {
            newErrors[`option_${index}_${i}`] =
              "Option is required";
          }
        });
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  const validateStep1 = () => {
    let newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Please enter company name";
    }
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Please enter job title";
    }
    if (!formData.minExperience && formData.minExperience !== 0) {
      newErrors.minExperience = "Select minimum experience";
    }
    if (formData.minExperience === "") {
      newErrors.minExperience = "Select minimum experience";
    }

    if (formData.maxExperience === "") {
      newErrors.maxExperience = "Select maximum experience";
    }

    if (
      formData.minExperience !== "" &&
      formData.maxExperience !== "" &&
      Number(formData.maxExperience) <= Number(formData.minExperience)
    ) {
      newErrors.maxExperience =
        "Maximum experience must be greater than minimum experience";
    }
    if (!formData.jobType) {
      newErrors.jobType = "Select a job type";
    }
    if (!formData.minSalary) {
      newErrors.minSalary = "Enter minimum salary";
    } else if (Number(formData.minSalary) <= 5000) {
      newErrors.minSalary =
        "Minimum monthly salary must be greater than ₹5,000";
    }

    if (!formData.maxSalary) {
      newErrors.maxSalary = "Enter maximum salary";
    } else if (
      Number(formData.maxSalary) <= Number(formData.minSalary)
    ) {
      newErrors.maxSalary =
        "Maximum salary must be greater than minimum salary";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  const validateStep2 = () => {
    let newErrors = {};

    if (!formData.department) {
      newErrors.department = "Choose the relevant department for this job";

    }

    if (!formData.jobRole) {
      newErrors.jobRole = "Choose the role you are hiring for";
    }

    if (!formData.jobLocation) {
      newErrors.jobLocation = "Choose where the job will be based";
    }

    if (!selectedSkills || selectedSkills.length === 0) {
      newErrors.skills = " Add at least one skill for this job";
    }

    if (!formData.qualification) {
      newErrors.qualification = " Select the required qualification";
    }

    if (!formData.industry || formData.industry.length === 0) {
      newErrors.industry = "Select at least one industry";
    }

    if (!formData.gender) {
      newErrors.gender = "Select a gender preference";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  const validateJobDesc = () => {
    const text = (jobDesc || "")
      .replace(/<[^>]+>/g, "")
      .trim();

    let newErrors = { ...errors };

    if (!text) {
      newErrors.jobDesc = "Job description is required";
    } else if (text.length < 20) {
      newErrors.jobDesc = "At least 20 characters required";
    } else {
      delete newErrors.jobDesc;
    }

    setErrors(newErrors);

    return !newErrors.jobDesc;
  };

  const validateContact = () => {
    let newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    const urlRegex =
      /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i;

    // Preferred Contact Method
    if (!contactData.contactMethod) {
      newErrors.contactMethod = "Select contact method";
    }

    if (!contactData.allowDirectCall) {
      newErrors.allowDirectCall =
        "Please select Yes or No";
    }

    // Email
    if (!contactData.email) {
      newErrors.email = "Enter email address";
    } else if (!emailRegex.test(contactData.email)) {
      newErrors.email = "Enter valid email (e.g. name@gmail.com)";
    }

    // Phone
    if (!contactData.phone) {
      newErrors.phone = "Enter mobile number";
    } else if (!phoneRegex.test(contactData.phone)) {
      newErrors.phone = "Enter valid 10-digit number";
    }

    // Call Time
    if (!contactData.callFrom) {
      newErrors.callFrom = "Select start time";
    }

    if (!contactData.callTo) {
      newErrors.callTo = "Select end time";
    }

    // Available Days
    if (selectedDays.length === 0) {
      newErrors.days = "Select at least one day";
    }

    // Application Method
    if (!contactData.applicationMethod) {
      newErrors.applicationMethod = "Select application method";
    }

    // External Link
    if (
      contactData.applicationMethod === "External Link"
    ) {
      if (!contactData.externalLink) {
        newErrors.externalLink = "Enter application link";
      } else if (!urlRegex.test(contactData.externalLink)) {
        newErrors.externalLink = "Enter valid URL";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const [selectedGender, setSelectedGender] = useState("");
  const [companyDesc, setCompanyDesc] = useState("");

  const genders = [
    { label: "Female", icon: <FaFemale /> },
    { label: "Male", icon: <FaMale /> },
    { label: "Both", icon: <FaUsers /> }
  ];
  const [selectedIncentives, setSelectedIncentives] = useState([]);
  const incentiveSuggestions = [
    "Office cab/shuttle",
    "Food allowance",
    "Health insurance",
    "Annual bonus",
    "Provident fund",
    "Management",
    "Insurance",
  ];
  return (
    <>
      {/* TABS START */}
      <div className="tabs-wrapper">
        <div className="progress-line">
          <div
            className="progress-fill"
            style={{
              width: `${(activeTab / 4) * 100}%`
            }}
          ></div>
        </div>

        {[
          "Job details",
          "Candidate preferences",
          "Screening questions",
          "Job description",
          "Communication preferences",
        ].map((tab, index) => {
          const isCompleted = activeTab > index;
          const isActive = activeTab === index;

          return (
            <div
              key={index}
              className="tab-step"
              onClick={() => setActiveTab(index)}
            >
              <div
                className={`circle ${isCompleted ? "completed" : isActive ? "active" : ""
                  }`}
              >
                {isCompleted ? "✔" : index + 1}
              </div>
              <span className="label">{tab}</span>
            </div>
          );
        })}
      </div>


      <form className="default-form">
        <div className="row">
          {/* <!-- Input --> */}

          {activeTab === 0 && (
            <>
              <div className="form-group col-lg-12">
                <label>Your Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Company name"
                />


                {errors.companyName && (
                  <span className="error-text">{errors.companyName}</span>
                )}
              </div>

              <div className="form-group col-lg-6">
                <label>Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="Enter a clear and specific job title to attract relevant candidates."
                />

                {!formData.jobTitle?.trim() && !errors.jobTitle && (
                  <small className="text-muted">
                    Ex.: Software Developer, HR Manager, Sales Executive
                  </small>
                )}

                {errors.jobTitle && (
                  <span className="error-text">{errors.jobTitle}</span>
                )}
              </div>

              <div className="form-group col-lg-6">
                <label>Job Type</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select job type</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Remote">Remote</option>
                </select>
                {!formData.jobType && !errors.jobType && (
                  <small className="text-muted">
                    Select the job type.
                  </small>
                )}
                {errors.jobType && (
                  <span className="error-text">{errors.jobType}</span>
                )}
              </div>

              <div className="form-group col-lg-8">
                <label>Work experience</label>

                <div className="experience-range">
                  <select
                    name="minExperience"
                    className="form-select"
                    value={formData.minExperience || ""}
                    onChange={handleChange}
                  >
                    <option value="">Min</option>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
                      <option key={year} value={year}>
                        {year} year{year !== 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>

                  <span className="experience-separator">to</span>

                  <select
                    name="maxExperience"
                    className="form-select"
                    value={formData.maxExperience || ""}
                    onChange={handleChange}
                  >
                    <option value="">Max</option>

                    {Array.from(
                      { length: 20 - (Number(formData.minExperience) + 1) + 1 },
                      (_, i) => Number(formData.minExperience || 0) + 1 + i
                    ).map((year) => (
                      <option key={year} value={year}>
                        {year} year{year !== 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {errors.minExperience && (
                  <span className="error-text">{errors.minExperience}</span>
                )}

                {errors.maxExperience && (
                  <span className="error-text">{errors.maxExperience}</span>
                )}
                <div className="form-check mt-2">
                  <input
                    type="checkbox"
                    id="fresherAllowed"
                    className="form-check-input"
                    checked={formData.fresherAllowed || false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fresherAllowed: e.target.checked,
                      }))
                    }
                  />

                  <label
                    htmlFor="fresherAllowed"
                    className="form-check-label"
                  >
                    Freshers can also apply
                  </label>
                </div>

              </div>


              <div className="form-group col-lg-8">
                <label>Salary per month</label>

                <div className="experience-range">
                  <div className="salary-input">
                    <span className="currency">₹</span>

                    <input
                      type="number"
                      name="minSalary"
                      value={formData.minSalary || ""}
                      onChange={handleChange}
                      placeholder="Min Salary"
                    // className="form-control"
                    />
                  </div>

                  <span className="experience-separator">to</span>

                  <div className="salary-input">
                    <span className="currency">₹</span>

                    <input
                      type="number"
                      name="maxSalary"
                      value={formData.maxSalary || ""}
                      onChange={handleChange}
                      placeholder="Max Salary"
                    // className="form-control"
                    />
                  </div>
                </div>

                {errors.minSalary && (
                  <div className="error-text mt-1">
                    {errors.minSalary}
                  </div>
                )}

                {errors.maxSalary && (
                  <div className="error-text mt-1">
                    {errors.maxSalary}
                  </div>
                )}
              </div>
              <div className="form-group col-lg-8 col-md-12">
                <label>
                  Incentives
                  <span style={{ fontSize: "12px", color: "#999" }}>
                    (Optional)
                  </span>
                </label>

                <Select
                  isMulti
                  options={incentives}
                  value={selectedIncentives}
                  onChange={(selected) =>
                    setSelectedIncentives(selected || [])
                  }
                  placeholder="Search for perks and benefits"
                  className="basic-multi-select"
                  classNamePrefix="select"
                />

                <div className="suggestion-title">
                  Suggestions
                </div>

                <div className="suggestion-chips">
                  {incentiveSuggestions.map((item) => (
                    <div
                      key={item}
                      className="suggestion-chip"
                      onClick={() => {
                        const exists = selectedIncentives.some(
                          (option) => option.value === item
                        );

                        if (!exists) {
                          setSelectedIncentives([
                            ...selectedIncentives,
                            {
                              value: item,
                              label: item,
                            },
                          ]);
                        }
                      }}
                    >
                      + {item}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* NEXT BUTTON */}
          {activeTab === 0 && (
            <div className="form-group col-lg-12 d-flex justify-content-end">
              <button
                type="button"
                className="theme-btn btn-style-one"
                onClick={() => {
                  console.log(formData);
                  if (validateStep1()) {
                    setActiveTab(1);
                  }
                }}
              >
                Next
              </button>
            </div>
          )}

        </div>
      </form >

      <form className="default-form">
        <div className="row">

          {activeTab === 1 && (
            <>
              <div className="form-group col-lg-6 col-md-12">
                <label>Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="chosen-single form-select"
                >
                  <option value="">Select</option>
                  <option value="Software Development">Software Development</option>
                  <option value="IT Security">IT Security</option>
                  <option value="Finance & Accounting">Finance & Accounting</option>
                  <option value="Sales & Business Development">Sales & Business Development</option>
                  <option value="UI/UX">UI/UX</option>
                  <option value="Others">Others</option>
                </select>

                {!formData.department?.length && !errors.department && (
                  <small className="text-muted">
                    Ex.: Software Development
                  </small>
                )}
                {errors.department && (
                  <span className="error-text">{errors.department}</span>
                )}
              </div>

              <div className="form-group col-lg-6 col-md-12">
                <label>Job Role</label>
                <select
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleChange}
                  className="chosen-single form-select"
                >
                  <option>Select</option>
                  <option>Frontend Developer</option>
                  <option>BackEnd Developer</option>
                  <option>Engineering & Technical</option>
                  <option>Billing & Accounts</option>
                  <option>Administrative & Support</option>
                  <option>Others</option>
                </select>
                {!formData.jobRole?.length && !errors.jobRole && (
                  <small className="text-muted">
                    Select your preferred Job Role
                  </small>
                )}
                {errors.jobRole && (
                  <span className="error-text">{errors.jobRole}</span>
                )}

              </div>

              <div className="form-group col-lg-6 col-md-12">
                <label>Job Location</label>
                <select
                  name="jobLocation"
                  value={formData.jobLocation}
                  onChange={handleChange}
                  className="chosen-single form-select"
                >
                  <option value="">Select</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Banglore">Banglore</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Others">Others</option>
                </select>
                {!formData.jobLocation?.length && !errors.jobLocation && (
                  <small className="text-muted">
                    Select Job Location
                  </small>
                )}
                {errors.jobLocation && (
                  <span className="error-text">{errors.jobLocation}</span>
                )}
              </div>

              <div className="form-group col-lg-6 col-md-12">
                <label> Add Skills</label>
                <Select
                  isMulti
                  className="basic-multi-select"
                  classNamePrefix="select"
                  options={skills}
                  value={selectedSkills}
                  onChange={(selected) => {
                    const updated = selected.map((item) => ({
                      ...item,
                      starred: item.starred || false,
                    }));
                    setSelectedSkills(updated);

                    setErrors((prev) => ({ ...prev, skills: "" }));
                  }}
                  components={{
                    MultiValueLabel: CustomMultiValueLabel
                  }}
                />

                {selectedSkills.length === 0 && !errors.skills && (
                  <small className="text-muted">
                    Select relevant skills required for this job
                  </small>
                )}
                {errors.skills && (
                  <span className="error-text">{errors.skills}</span>
                )}
              </div>


              <div className="form-group col-lg-6 col-md-12">
                <label>Candidate's qualification</label>
                <select
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="chosen-single form-select"
                >
                  <option value="">Select</option>
                  <option value="12th pass">12th pass</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD">PhD</option>
                </select>
                {errors.qualification && (
                  <span className="error-text">{errors.qualification}</span>
                )}
              </div>

              <div className="form-group col-lg-6 col-md-12">
                <label>Educational Degree  <span style={{ fontSize: "12px", color: "#999" }}>(Optional)</span></label>

                <CreatableSelect
                  isMulti
                  options={degree}
                  placeholder="Type or select degree"
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
              </div>

              <div className="form-group col-lg-6 col-md-12">
                <label> Candidate's industry you want to hire from</label>
                <Select
                  isMulti
                  options={industry}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Search for candidate industry..."
                  onChange={(selected) => {
                    setFormData((prev) => ({
                      ...prev,
                      industry: selected || [],
                    }));

                    setErrors((prev) => ({ ...prev, industry: "" }));
                  }}
                />
                {errors.industry && (
                  <span className="error-text">{errors.industry}</span>
                )}
              </div>

              <div className="form-group col-lg-6 col-md-12">
                <label>Degree Specification <span style={{ fontSize: "12px", color: "#999" }}>(Optional)</span></label>
                <select className="chosen-single form-select">
                  <option>Select</option>
                  <option>Technology</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                  <option>Management</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group col-lg-6 col-md-12">
                <label>Languages Known <span style={{ fontSize: "12px", color: "#999" }}>(Optional)</span></label>
                <Select
                  // defaultValue={languages[2]}
                  isMulti
                  name="colors"
                  options={languages}
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
              </div>

              <div className="form-group col-lg-6 col-md-12">
                <label>Gender</label>
                <div className="chip-container">
                  {genders.map((g) => (
                    <div
                      key={g.label}
                      className={`chip ${selectedGender === g.label ? "active" : ""}`}
                      onClick={() => {
                        setSelectedGender(g.label);

                        setFormData((prev) => ({
                          ...prev,
                          gender: g.label
                        }));
                        setErrors((prev) => ({
                          ...prev,
                          gender: "",
                        }));
                      }}
                    >
                      <span className="icon">{g.icon}</span>
                      {g.label}
                    </div>
                  ))}
                </div>

                {errors.gender && (
                  <span className="error-text">{errors.gender}</span>
                )}
              </div>

              <div className="d-flex justify-content-between align-items-center mt-4">
                <button
                  type="button"
                  className="theme-btn btn-style-one"
                  onClick={() => setActiveTab(0)}
                >
                  Back
                </button>

                {activeTab === 1 && (
                  <button
                    type="button"
                    className="theme-btn btn-style-one"
                    onClick={() => {
                      if (validateStep2()) {
                        setActiveTab(2);
                      }
                    }}
                  >
                    Next
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </form>

      <form className="default-form">
        <div className="row">

          {activeTab === 2 && (
            <>
              {questions.map((q, index) => (
                <div key={index} className="question-card">

                  {/* Mandatory */}
                  <div className="required-toggle">
                    <label>
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={() => {
                          const updated = [...questions];
                          updated[index].required = !updated[index].required;
                          updateQuestions(updated);
                        }}
                      />
                      Mandatory
                    </label>
                  </div>

                  {/* Question */}
                  <div className="question-header">
                    <span className="question-number">
                      {index + 1}.
                    </span>

                    <input
                      type="text"
                      className={`question-input ${errors[`question_${index}`]
                        ? "is-invalid"
                        : ""
                        }`}
                      placeholder="Enter screening question"
                      value={q.question}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[index].question = e.target.value;
                        updateQuestions(updated);
                      }}
                    />

                    {errors[`question_${index}`] && (
                      <span className="error-text"> {errors[`question_${index}`]}</span>
                    )}

                    {questions.length > 1 && (
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => {
                          const updated = questions.filter(
                            (_, i) => i !== index
                          );

                          updateQuestions(updated);
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Answer Type */}
                  <div className="question-type">
                    <label className="mb-2 d-block">
                      Candidate Answer Type
                    </label>

                    <select
                      value={q.type}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[index].type = e.target.value;

                        if (e.target.value === "options") {
                          updated[index].options = [""];
                        } else {
                          updated[index].options = [];
                        }

                        updateQuestions(updated);
                      }}
                    >
                      <option value="text">
                        Type Answer
                      </option>

                      <option value="yesno">
                        Yes / No
                      </option>

                      <option value="options">
                        Multiple Choice
                      </option>
                    </select>
                  </div>

                  {/* Multiple Choice Options */}
                  {q.type === "options" && (
                    <div className="options-box">
                      {q.options.map((opt, i) => (
                        <div key={i}>
                          <input
                            type="text"
                            placeholder={`Option ${i + 1}`}
                            value={opt}
                            className={`form-control ${errors[`option_${index}_${i}`]
                              ? "is-invalid"
                              : ""
                              }`}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[index].options[i] = e.target.value;
                              updateQuestions(updated);
                            }}
                          />

                          {/* {errors[`option_${index}_${i}`] && (
                            <div className="invalid-feedback d-block">
                              {errors[`option_${index}_${i}`]}
                            </div>
                          )} */}
                          {errors[`option_${index}_${i}`] && (
                            <span className="error-text"> {errors[`option_${index}_${i}`]}</span>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        className="add-option"
                        onClick={() => {
                          const updated = [...questions];
                          updated[index].options.push("");
                          updateQuestions(updated);
                        }}
                      >
                        + Add Option
                      </button>
                    </div>
                  )}

                  {/* Candidate Preview */}
                  <div className="candidate-preview mt-3">
                    <small className="text-muted">
                      Candidate Preview
                    </small>

                    {q.type === "text" && (
                      <input
                        type="text"
                        disabled
                        className="form-control mt-2"
                        placeholder="Candidate will type answer"
                      />
                    )}

                    {q.type === "yesno" && (
                      <div className="mt-2">
                        <label className="me-3">
                          <input type="radio" disabled />
                          <span className="ms-1">Yes</span>
                        </label>

                        <label>
                          <input type="radio" disabled />
                          <span className="ms-1">No</span>
                        </label>
                      </div>
                    )}

                    {q.type === "options" && (
                      <div className="mt-2">
                        {q.options.map((opt, i) => (
                          <div key={i}>
                            <input
                              type="radio"
                              disabled
                            />
                            <span className="ms-2">
                              {opt || `Option ${i + 1}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Question */}
              <div className="add-question-box">
                <button
                  type="button"
                  onClick={() => {
                    const updated = [
                      ...questions,
                      {
                        question: "",
                        type: "text",
                        required: true,
                        options: [],
                      },
                    ];

                    updateQuestions(updated);
                  }}
                >
                  + Add a Question
                </button>
              </div>

              {/* Suggested Questions */}
              <div className="suggested-box">
                <p>Suggested Questions</p>

                {suggestedQuestions.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    className="suggested-btn"
                    onClick={() => {
                      const updated = [
                        ...questions,
                        {
                          question: item.question,
                          type: item.type,
                          required: true,
                          options: [],
                        },
                      ];

                      updateQuestions(updated);
                    }}
                  >
                    + {item.question}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="d-flex justify-content-between align-items-center mt-4">
                <button
                  type="button"
                  className="theme-btn btn-style-one"
                  onClick={() => setActiveTab(1)}
                >
                  Back
                </button>

                <button
                  type="button"
                  className="theme-btn btn-style-one"
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </>
          )}

        </div>
      </form>

      <form className="default-form">
        <div className="row">

          {activeTab === 3 && (
            <>
              {/* Job Description */}
              <div className="form-group col-lg-12">
                <label>Job Description</label>

                <JobDescriptionBox
                  data={{ about: jobDesc }}
                  setData={(updated = {}) => {
                    const value = updated.about || "";

                    setJobDesc(value);

                    const text = value.replace(/<[^>]+>/g, "").trim();
                  }}
                />
                {errors.jobDesc && (
                  <span className="error-text">{errors.jobDesc}</span>
                )}

              </div>

              {/* About Company */}
              <div className="form-group col-lg-12">
                <label>
                  About Company{" "}
                  <span style={{ fontSize: "12px", color: "#999" }}>
                    (Optional)
                  </span>
                </label>

                <textarea
                  className=" about-input-company"
                  maxLength={250}
                  value={companyDesc}
                  onChange={(e) => setCompanyDesc(e.target.value)}
                  placeholder="Write about your company, culture, values..."
                />

                <div
                  className="text-end text-muted mt-1"
                  style={{ fontSize: "12px" }}
                >
                  {companyDesc.length} / 250
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-4">
                <button
                  type="button"
                  className="theme-btn btn-style-one"
                  onClick={() => setActiveTab(2)}
                >
                  Back
                </button>

                {activeTab === 3 && (
                  <button
                    type="button"
                    className="theme-btn btn-style-one"
                    onClick={() => {
                      if (validateJobDesc()) {
                        setActiveTab(4);
                      }
                    }}
                  >
                    Next
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </form>

      <form className="default-form">
        <div className="row">

          {activeTab === 4 && (
            <>
              <div className="form-group col-lg-6 col-md-12">
                <label>Allow candidates to call you directly for this job?</label>

                <div className="chip-container">
                  {callOptions.map((option) => (
                    <div
                      key={option.label}
                      className={`chip ${contactData.allowDirectCall === option.label
                        ? "active"
                        : ""
                        }`}
                      onClick={() => {
                        setContactData((prev) => ({
                          ...prev,
                          allowDirectCall: option.label,
                        }));

                        setErrors((prev) => ({
                          ...prev,
                          allowDirectCall: "",
                        }));
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
                {errors.allowDirectCall && (
                  <span className="error-text">{errors.allowDirectCall}</span>
                )}
              </div>

              {/* Contact Method */}
              <div className="form-group col-lg-6 col-md-12">
                <label>Preferred Contact Method</label>

                <div className="chip-container">
                  {contactMethods.map((method) => (
                    <div
                      key={method.label}
                      className={`chip ${contactData.contactMethod === method.label ? "active" : ""
                        }`}
                      onClick={() => {
                        setContactData((prev) => ({
                          ...prev,
                          contactMethod: method.label,
                        }));

                        setErrors((prev) => ({
                          ...prev,
                          contactMethod: "",
                        }));
                      }}
                    >
                      <span className="icon">{method.icon}</span>
                      {method.label}
                    </div>
                  ))}
                </div>

                {errors.contactMethod && (
                  <span className="error-text">{errors.contactMethod}</span>
                )}
              </div>
              {/* Contact Email */}
              <div className="form-group col-lg-6">
                <label>Contact Email</label>
                <input
                  type="email"
                  name="email"
                  value={contactData.email}
                  onChange={handleContactChange}
                  className={`form-control ${errors.email ? "error-border" : ""}`}
                  placeholder="example@gmail.com"
                />

                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>

              {/* Contact Number */}
              <div className="form-group col-lg-6">
                <label className="form-label">Contact Number</label>

                <div className={`phone-input ${errors.phone ? "error" : ""}`}>
                  <span className="country-code">+91</span>
                  <input
                    type="text"
                    name="phone"
                    value={contactData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        handleContactChange({
                          target: { name: "phone", value },
                        });
                      }
                    }}
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>

                {errors.phone && (
                  <span className="error-text">{errors.phone}</span>
                )}
              </div>

              {/* Call Time */}
              <div className="form-group col-lg-6">
                <label>Receive Calls Between</label>
                <div style={{ display: "flex", gap: "10px" }}>

                  <input
                    type="time"
                    className={`form-control ${errors.callFrom ? "error-border" : ""}`}
                    name="callFrom"
                    value={contactData.callFrom || ""}
                    onChange={handleContactChange}
                  />

                  <span style={{ alignSelf: "center" }}>to</span>
                  <input
                    type="time"
                    className={`form-control ${errors.callTo ? "error-border" : ""}`}
                    name="callTo"
                    value={contactData.callTo || ""}
                    onChange={handleContactChange}
                  />

                </div>
                {errors.callFrom && (
                  <span className="error-text">{errors.callFrom}</span>
                )}
                {errors.callTo && (
                  <span className="error-text">{errors.callTo}</span>
                )}

              </div>

              {/* Available Days */}
              <div className="form-group col-lg-6">
                <label>Available Days</label>
                <div className="day-selector">
                  {days.map((day) => (
                    <div
                      key={day}
                      className={`day-chip ${selectedDays.includes(day) ? "active" : ""
                        }`}
                      onClick={() => {
                        if (selectedDays.includes(day)) {
                          setSelectedDays(
                            selectedDays.filter((d) => d !== day)
                          );
                        } else {
                          setSelectedDays([...selectedDays, day]);
                        }
                      }}
                    >
                      {day}

                    </div>
                  ))}

                </div>
                {errors.days && (
                  <span className="error-text">{errors.days}</span>
                )}
              </div>

              {/* Application Method */}
              {/* <div className="form-group col-lg-6">
                <label>Application Method</label>
                <select
                  className="form-select"
                  name="applicationMethod"
                  value={contactData.applicationMethod || ""}
                  onChange={handleContactChange}
                >
                  <option value="">Select</option>
                  <option value="Apply on Portal">Apply on Portal</option>
                  <option value="Apply via Email">Apply via Email</option>
                  <option value="External Link">External Link</option>
                </select>

                {errors.applicationMethod && (
                  <p className="text-danger small">
                    {errors.applicationMethod}
                  </p>
                )}
              </div> */}

              {/* External Link */}
              <div className="form-group col-lg-6">
                <label>
                  External Application Link <span>(Optional)</span>
                </label>
                <input
                  type="text"
                  name="externalLink"
                  value={contactData.externalLink || ""}
                  onChange={handleContactChange}
                  className={`form-control ${errors.externalLink ? "error-border" : ""
                    }`}
                  placeholder="https://yourcompany.com/apply"
                />

                {/* {errors.externalLink && (
                  <p className="text-danger small">
                    {errors.externalLink}
                  </p>
                )} */}
              </div>

              {/* Notifications */}
              <div className="form-group col-lg-12">
                <label>Notifications</label>

                <div className="d-flex gap-3">
                  <label>
                    <input type="checkbox" id="emailNotify" /> Email Notifications
                  </label>

                  <label>
                    <input type="checkbox" id="smsNotify" /> SMS Notifications
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="form-group col-lg-12">
                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="theme-btn btn-style-one"
                    onClick={() => setActiveTab(3)}
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    className="theme-btn btn-style-one"
                    onClick={() => {
                      if (validateContact()) {
                        handleSubmit();
                      }
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </form >

    </>
  );
};

export default PostBoxForm;
