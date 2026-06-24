'use client'

import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { useState, useEffect, useRef } from "react";
import JobDescriptionBox from "./JobDescriptionBox";
import { FaMale, FaFemale, FaUsers, FaSadCry } from "react-icons/fa";
import { FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import { MdOutlineContactPhone } from "react-icons/md";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";


const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});
const MAX_LENGTH = 500;

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, false] }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["link", "image"],
  ],
};

const formats = [
  "header",
  "bold",
  "color",
  "background",
  "italic",
  "underline",
  "blockquote",
  "code-block",
  "list",
  "align",
  "size",
  "link",
  "image",
];

const PostBoxForm = ({ activeTab, setActiveTab }) => {
  const quillRef = useRef(null);
  const [charCount, setCharCount] = useState(0);


  const [compName, setCompName] = useState("");

  useEffect(() => {
    getCookiesValue();
  }, []);
  const getCookiesValue = async () => {
    try {
      const response = await fetch("/api/cookies-details", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      const data = await response.json();
      let fullname = data.data;
      console.log(fullname)
      setFormData((prev) => ({
        ...prev,
        companyName: fullname
      }));

      setCompName(fullname);

    } catch (error) {
      console.error(error);
    }
  };

  const [languages, setLanguages] = useState([]);
  const [industry, setIndustry] = useState([]);
  const [incentives, setIncentives] = useState([]);
  const [incentiveSuggestions, setIncentiveSuggestions] = useState([]);
  const [selectedIncentives, setSelectedIncentives] = useState([]);

  const [selectedIndustrys, setselectedIndustrys] = useState([]);
  const [selectedLanguages, setselectedLanguages] = useState([]);

  const [department, setDepartment] = useState([]);
  const [groupedDepartments, setGroupedDepartments] = useState([]);
  const [jobRoleList, setJobRoleList] = useState([]);

  const [jobTitleList, setJobTitleList] = useState([]);
  const [showJobTitleList, setShowJobTitleList] = useState(false);

  const [degree, setDegree] = useState([]);
  const [subDegree, setSubDegree] = useState([]);

  const [locationList, setLocationList] = useState([]);
  const [showLocationList, setShowLocationList] = useState(false);

  const [skills, setSkills] = useState([]);

  const [degreeList, setDegreeList] = useState([]);
  const [showDegreeList, setShowDegreeList] = useState(false);

  const [SpecializationList, setSpecializationList] = useState([]);
  const [showSpecializationList, setShowSpecializationList] = useState(false);

  const [isEnabled, setIsEnabled] = useState(false);

  const [loading, setLoading] = useState(false);


  useEffect(() => {
    getIndustry();
    getLanguages();
    getBenifits();
    getDepartment();
    getSkills();
  }, []);


  const getDegree = async (term) => {

    if (!term || term.length < 2) {
      setDegreeList([]);
      return;
    }
    if (formData.qualification === "Graduate" || formData.qualification === "Masters" || formData.qualification === "PhD") {

      try {

        const response = await fetch("/api/list-courses-search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            term: term,
            eduType: formData.qualification,
          }),
        });

        const data = await response.json();
        //console.log("location fetched:", JSON.stringify(data));

        const options = data.data.map((item) => ({
          value: item.key,
          label: item.value
        }));
        setDegreeList(options);
        setShowDegreeList(true);

      } catch (error) {
        console.error(error);
      }
    }
  };

  const getSpecialization = async (term) => {


    if (!term || term.length < 2) {
      setSpecializationList([]);
      return;
    }
    if (formData.qualification === "Graduate" || formData.qualification === "Masters" || formData.qualification === "PhD") {

      //console.log("Fetching Specialization for term:", term);
      try {

        const response = await fetch("/api/list-specialization-search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            term: term,
            eduType: formData.qualification,
            id: formData.degreeId,
          }),
        });

        const data = await response.json();
        //console.log("Specializations fetched:", JSON.stringify(data));

        setSpecializationList(data && data.data ? data.data : []);
        setShowSpecializationList(true);
      } catch (error) {
        console.error(error);

      }
    }

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
      //console.log("skills fetched:", JSON.stringify(data.data));
      const options = data.data.map((item) => ({
        value: item.key,
        label: item.value,
      }));
      setSkills(options);
    } catch (error) {
      console.error(error);
    }
  };

  const getLocation = async (term) => {
    if (!term || term.length < 2) {
      setLocationList([]);
      return;
    }
    //console.log("Fetching universities for term:", term);
    try {

      const response = await fetch("/api/list-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: term,
        }),
      });

      const data = await response.json();
      //console.log("location fetched:", JSON.stringify(data));

      const options = data.data.map((item) => ({
        value: item.key,
        label: item.value,
        label2: item.value2
      }));

      setLocationList(options);
      setShowLocationList(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getDepartment = async () => {
    try {
      const response = await fetch("/api/list-department-sub", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: '',
        }),
      });
      const data = await response.json();

      const options = data.data.map((item) => ({
        value: item.key,
        label: item.value,
        label2: item.value2
      }));
      //console.log("Department fetched:", JSON.stringify(options));
      setDepartment(department);
      const groupedDepartments = options.reduce((acc, item) => {
        if (!acc[item.label2]) {
          acc[item.label2] = [];
        }
        acc[item.label2].push(item);

        return acc;
      }, {});

      setGroupedDepartments(groupedDepartments);

    } catch (error) {
      console.error(error);
    }
  };

  const getJobRoleByDepartment = async (term) => {
    if (!term || term.length == 0) {
      setJobRoleList([]);
      return;
    }
    //console.log("Fetching universities for term:", term);
    try {

      const response = await fetch("/api/list-job-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: term,
        }),
      });

      const data = await response.json();
      //console.log("Job Role fetched:", JSON.stringify(data));
      const options = data.data.map((item) => ({
        value: item.key,
        label: item.value,
      }));
      setJobRoleList(options);


    } catch (error) {
      console.error(error);
    }
  };
  const getBenifits = async () => {
    try {
      const response = await fetch("/api/list-benifits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: '',
        }),
      });
      const data = await response.json();
      //console.log("Benifits fetched:", JSON.stringify(data.data));
      const options = data.data.map((item) => ({
        value: item.key,
        label: item.value,
      }));
      setIncentives(options);
      const options2 = data.data.slice(0, 5).map((item) => ({
        value: parseInt(item.key),
        label: item.value,
      }));
      setIncentiveSuggestions(options2)
      console.log(options2)

    } catch (error) {
      console.error(error);
    }
  };

  const getIndustry = async () => {
    try {
      const response = await fetch("/api/list-industry-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: '',
        }),
      });
      const data = await response.json();
      //console.log("Industry fetched:", JSON.stringify(data.data));
      const options = data.data.map((item) => ({
        value: item.key,
        label: item.value,
      }));
      setIndustry(options);
    } catch (error) {
      console.error(error);
    }
  };

  const getLanguages = async () => {
    try {

      const response = await fetch("/api/list-languages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: '',
        }),
      });
      const data = await response.json();
      // console.log("Languages fetched:", JSON.stringify(data.data));
      const options = data.data.map((item) => ({
        value: item.key,
        label: item.value,
      }));
      setLanguages(options);
    } catch (error) {
      console.error(error);
    }
  };

  const getJobTitle = async (term) => {
    if (!term || term.length < 2) {
      setJobTitleList([]);
      return;
    }
    //console.log("Fetching universities for term:", term);
    try {

      const response = await fetch("/api/list-job-title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: term,
        }),
      });

      const data = await response.json();
      //console.log("Jobtitle fetched:", JSON.stringify(data));

      setJobTitleList(data && data.data ? data.data : []);
      setShowJobTitleList(true);
    } catch (error) {
      console.error(error);
    }
  };


  const [questions, setQuestions] = useState([
    {
      question: "",
      type: "text",
      required: true,
      options: [],
      preferredAnswer: "",
    }
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

    // Screening Questions Tab
    if (activeTab === 2) {
      if (!validateQuestions()) {
        return;
      }

      const screeningQuestions = questions.map((q, index) => ({
        QNo: String(index + 1),

        Que: q.question,

        QType:
          q.type === "text"
            ? "Answer"
            : q.type === "yesno"
              ? "Yes/No"
              : "MultiOption",

        QOpt: q.options || [],

        PreferredAnswer: q.preferredAnswer || "",

        IsMandatory: q.required,
      }));

      console.log("Screening Questions:", screeningQuestions);

      // Save in formData
      setFormData((prev) => ({
        ...prev,
        screeningQuestions: screeningQuestions,
      }));
    }

    // Job Description
    if (activeTab === 3) {
      if (!validationJobDesc()) {
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
          return {
            ...item,
            starred: !item.starred,
          };
        }
        return item;
      });

      setSelectedSkills(updated);

      setFormData((prev) => ({
        ...prev,
        skills: updated.map((item) => ({
          skill: item.value,
          starred: item.starred,
        })),
      }));

      selectProps.onChange(updated, {
        action: "select-option",
      });
    };

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <span
          onClick={toggleStar}
          style={{
            cursor: "pointer",
            color: data.starred ? "#9b9000" : "#ccc",
            fontSize: "20px",
          }}
        >
          ★
        </span>

        <span>{data.label}</span>
      </div>
    );
  };

  // const CustomMultiValueLabel = (props) => {
  //   const { data, selectProps } = props;

  //   const toggleStar = () => {
  //     const updated = selectProps.value.map((item) => {
  //       if (item.value === data.value) {
  //         return { ...item, starred: !item.starred };
  //       }
  //       return item;
  //     });

  //     selectProps.onChange(updated);
  //   };


  //   return (
  //     <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>

  //       <span
  //         onClick={toggleStar}
  //         style={{
  //           cursor: "pointer",
  //           color: data.starred ? "#1967d2" : "#ccc", // blue when active
  //           fontSize: "20px"
  //         }}
  //       >
  //         ★
  //       </span>

  //       {/* Skill Name */}
  //       <span>{data.label}</span>
  //     </div>
  //   );
  // };

  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    jobTitleId: "",
    minExperience: "",
    maxExperience: "",
    fresherAllowed: false,

    jobType: "",
    workMode: "",

    incentives: [],

    minSalary: "",
    maxSalary: "",
    //  step 2 fields
    department: "",
    departmentId: "",
    jobRole: "",
    jobRoleId: "",
    jobLocation: "",
    jobLocationId: "",
    qualification: "",

    degree: "",
    degreeId: "",

    specialization: "",
    specializationId: "",
    skills: [],
    industryIds: [],

    languages: [],
    languagesId: [],

    gender: "Both",

    // step 4 fields
    contactMethod: "",
    cemail: "",
    cphone: "",
    callFrom: "",
    callTo: "",
    applicationMethod: "",
    externalLink: "",
    allowDirectCall: "No",
    days: [],

    jobDesc: "",
    aboutCompany: "",
    screeningQuestions: []
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

    if (value === "Graduate" || value === "Masters" || value === "PhD") {
      setIsEnabled(true)
    }
    else {
      setFormData((prev) => ({
        ...prev,
        degree: "",
        degreeId: "",
        specialization: "",
        specializationId: "",
      }));

      setIsEnabled(false)
    }

    if (name === "minExperience") {
      setFormData((prev) => ({
        ...prev,
        minExperience: value,
        maxExperience: "",
      }));

      setErrors((prev) => ({
        ...prev,
        "minExperience": "",
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

      setErrors((prev) => ({
        ...prev,
        "minSalary": "",
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };


  const validateQuestions = () => {
    let newErrors = {};

    questions.forEach((q, index) => {

      // Question
      if (!q.question?.trim()) {
        newErrors[`question_${index}`] =
          "Please enter a question";
      }

      // Type Answer
      if (q.type === "text") {
        if (!q.preferredAnswer?.trim()) {
          newErrors[`preferred_${index}`] =
            "Please enter preferred answer";
        }
      }

      // Yes No
      if (q.type === "yesno") {
        if (!q.preferredAnswer) {
          newErrors[`preferred_${index}`] =
            "Please select preferred answer";
        }
      }

      // Multiple Choice
      if (q.type === "options") {

        if (q.options.length < 2) {
          newErrors[`options_${index}`] =
            "Minimum 2 options required";
        }

        q.options.forEach((opt, i) => {
          if (!opt.trim()) {
            newErrors[`option_${index}_${i}`] =
              "Please enter option";
          }
        });

        if (!q.preferredAnswer) {
          newErrors[`preferred_${index}`] =
            "Please select preferred option";
        }
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const validationJobDetails = () => {
    let newErrors = {};

    formData.companyName = compName;

    if (!formData.companyName || formData.companyName.length < 3) {
      newErrors.companyName = "Please enter company name";
    }
    if (!formData.jobTitle || formData.jobTitle.length < 3) {
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
    if (!formData.workMode) {
      newErrors.workMode = "Select a work Mode";
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

  const validationCandidateDetails = () => {
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

    if (!formData.industryIds || formData.industryIds.length === 0) {
      newErrors.industryIds = "Select at least one industry";
    }

    if (!formData.gender) {
      newErrors.gender = "Select a gender preference";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  const handleJobDescriptionChange = (
    content,
    delta,
    source,
    editor
  ) => {
    const text = editor.getText().trim();

    if (text.length > MAX_LENGTH + 1) {
      const quill = quillRef.current.getEditor();
      quill.deleteText(MAX_LENGTH, text.length);
      return;
    }

    setCharCount(text.length);

    if (validateInput(text)) {
      setFormData((prev) => ({
        ...prev,
        jobDesc: content,
      }));
    }
  };
  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const validationJobDesc = () => {
    const text = (formData.jobDesc || "")
      .replace(/<[^>]+>/g, "")
      .trim();

    let newErrors = { ...errors };

    if (!text) {
      newErrors.jobDesc = "Job Description is required";
    } else if (text.length < 20) {
      newErrors.jobDesc = "At least 20 characters required";
    } else {
      delete newErrors.jobDesc;
    }
    setErrors(newErrors);
    return !newErrors.jobDesc;
  };

  const validationContact = () => {
    let newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    const urlRegex =
      /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i;

    // Preferred Contact Method
    if (!formData.contactMethod) {
      newErrors.contactMethod = "Select contact method";
    }

    if (!formData.allowDirectCall) {
      newErrors.allowDirectCall =
        "Please select Yes or No";
    }

    // Email
    if (!formData.cemail) {
      newErrors.cemail = "Enter email address";
    } else if (!emailRegex.test(formData.cemail)) {
      newErrors.cemail = "Enter valid email (e.g. name@gmail.com)";
    }

    // Phone
    if (!formData.cphone) {
      newErrors.cphone = "Enter mobile number";
    } else if (!phoneRegex.test(formData.cphone)) {
      newErrors.cphone = "Enter valid 10-digit contact number";
    }

    // Call Time
    if (!formData.callFrom) {
      newErrors.callFrom = "Select start time";
    }

    if (!formData.callTo) {
      newErrors.callTo = "Select end time";
    }

    // Available Days
    if (selectedDays.length === 0) {
      newErrors.days = "Select at least one day";
    }

    // Application Method
    // if (!formData.applicationMethod) {
    //   newErrors.applicationMethod = "Select application method";
    // }

    // // External Link
    // if (
    //   formData.applicationMethod === "External Link"
    // ) {
    //   if (!formData.externalLink) {
    //     newErrors.externalLink = "Enter application link";
    //   } else if (!urlRegex.test(formData.externalLink)) {
    //     newErrors.externalLink = "Enter valid URL";
    //   }
    // }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [selectedGender, setSelectedGender] = useState("Both");
  const [companyDesc, setCompanyDesc] = useState("");

  const genders = [
    { label: "Female", icon: <FaFemale /> },
    { label: "Male", icon: <FaMale /> },
    { label: "Both", icon: <FaUsers /> }
  ];

  const validateInput = (value) => {
    const regex = /^[a-zA-Z0-9\s.,!?()&'":;-]*$/;
    return regex.test(value);
  };
  const handleCompanyDescChange = (e) => {
    const value = e.target.value;

    if (/<[^>]*>/.test(value)) {
      toast.error("HTML tags are not allowed")
      return;
    }
    if (validateInput(value)) {

      setFormData((prev) => ({
        ...prev,
        aboutCompany: value,
      }));
      setCompanyDesc(value)
    }
  };


  const handleSubmit = async () => {

    const screeningQuestions = questions.map((q, index) => ({
      QNo: String(index + 1),

      Que: q.question,

      QType:
        q.type === "text"
          ? "Answer"
          : q.type === "yesno"
            ? "Yes/No"
            : "MultiOption",

      QOpt: q.options || [],

      PreferredAnswer: q.preferredAnswer || "",

      IsMandatory: q.required,
    }));



    let haError = true;

    if (!validationJobDetails()) {
      toast.error("Recheck job details section");
      haError = false;
      return;
    }
    if (!validationCandidateDetails()) {
      toast.error("Recheck candidate section");
      haError = false;
      return;
    }
    if (!validateQuestions()) {
      toast.error("Recheck questions section");
      haError = false;
      return;
    }
    if (!validationJobDesc()) {
      toast.error("Recheck job description section");
      haError = false;
      return;
    }
    if (!validationContact()) {
      toast.error("Recheck communication section");
      haError = false;
      return;
    }

    if (haError) {



      setFormData((prev) => ({
        ...prev,
        screeningQuestions: screeningQuestions,
      }));

      console.log(formData.days)
      setFormData((prev) => ({
        ...prev,
        days: selectedDays,
      }));



      try {

        setLoading(true);
        const res = await fetch("/api/emp-job-post", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
          }),
        });

        const user = await res.json();
        console.log("Response from /api/emp-job-post:", user);

        if (!res.ok) {
          toast.error(user.message || "Profile update failed");
          setLoading(false);
          return;
        }

        toast.success(user.message);
      } catch (error) {
        console.error(error);
        toast.error("Profile update failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };
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
          "Candidate",
          "Questions",
          "Job Description",
          "Communication",
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
                  readOnly
                  type="text"
                  name="companyName"
                  value={compName}
                  onChange={handleChange}
                  placeholder="Company name"
                />


                {errors.companyName && (
                  <span className="error-text">{errors.companyName}</span>
                )}
              </div>

              <div className="form-group col-lg-6">
                <label>Job Title   </label>
                <input
                  placeholder="Start typing to search job title..."
                  type="text"
                  value={formData.jobTitle || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      jobTitle: e.target.value,
                    }));

                    getJobTitle(e.target.value);
                    setShowJobTitleList(true);

                    setErrors((prev) => ({
                      ...prev,
                      "jobTitle": "",
                    }));

                  }}
                />

                {showJobTitleList && jobTitleList.length > 0 && (
                  <ul
                    style={{
                      position: "absolute",
                      width: "96%",
                      background: "#fff",
                      border: "1px solid rgb(185 198 239)",
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      maxHeight: "200px",
                      overflowY: "auto",
                      zIndex: 1000,
                    }}
                  >
                    {jobTitleList.map((item) => (
                      <li
                        key={item.key}
                        style={{
                          padding: "4px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            jobTitle: item.value,
                            jobTitleId: item.key,
                          }));

                          setJobTitleList(false);
                        }}
                      >
                        {item.value}
                      </li>
                    ))}
                  </ul>
                )}
                {errors.jobTitle && (
                  <span className="error-text">
                    {errors.jobTitle}
                  </span>
                )}
              </div>


              <div className="form-group col-lg-3">
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
                {errors.jobType && (
                  <span className="error-text">{errors.jobType}</span>
                )}
              </div>
              <div className="form-group col-lg-3">
                <label>Work Mode</label>
                <select
                  name="workMode"
                  value={formData.workMode}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select Work Mode</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>

                </select>
                {errors.workMode && (
                  <span className="error-text">{errors.workMode}</span>
                )}
              </div>
              <div className="form-group col-lg-6">
                <label>Work experience</label>
                <div className="row">
                  <div className="col-md-6 col-sm-12">
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
                    {errors.minExperience && (
                      <span className="error-text">{errors.minExperience}</span>
                    )}
                  </div>
                  <div className="col-md-6 col-sm-12 ">
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
                    {errors.maxExperience && (
                      <span className="error-text">{errors.maxExperience}</span>
                    )}
                  </div>
                </div>

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


              <div className="form-group col-lg-6">
                <label>Salary per month</label>

                <div className="row">
                  <div className="col-md-6 col-sm-12">
                    <div className="">
                      <input
                        type="number"
                        name="minSalary"
                        value={formData.minSalary || ""}
                        onChange={handleChange}
                        placeholder="Min Salary"
                      // className="form-control"
                      />
                    </div>
                    {errors.minSalary && (
                      <div className="error-text mt-1">
                        {errors.minSalary}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6 col-sm-12">

                    <div className=" ">
                      <input
                        type="number"
                        name="maxSalary"
                        value={formData.maxSalary || ""}
                        onChange={handleChange}
                        placeholder="Max Salary"
                      // className="form-control"
                      />
                    </div>
                    {errors.maxSalary && (
                      <div className="error-text mt-1">
                        {errors.maxSalary}
                      </div>
                    )}
                  </div>
                </div>

                <label
                  style={{ paddingTop: "10px" }}
                  className="form-check-label"
                >
                  <br></br>
                </label>
              </div>

              <div className="form-group col-lg-12 col-md-12">
                <label>
                  Incentives
                  <span style={{ fontSize: "12px", color: "#999" }}>
                    (Optional)
                  </span>
                </label>

                <Select
                  instanceId="select-incentive"   // <-- add this
                  isMulti
                  classNamePrefix="custom-select"
                  options={incentives}
                  value={selectedIncentives}

                  onChange={(selected) => {
                    const selectedOptions = selected || [];
                    setSelectedIncentives(selectedOptions);
                    const ids = (selected || []).map((item) => item.value);
                    setFormData((prev) => ({
                      ...prev,
                      incentives: ids,
                    }));

                  }}

                  placeholder="Search for perks and benefits"
                  className="basic-multi-select"
                />



                {/* <div className="suggestion-title">
                  Suggestions
                </div>
                <div className="suggestion-chips">
                  {incentiveSuggestions.map((item, index) => (
                    <div
                      key={item.key}
                      className="suggestion-chip"
                      onClick={() => {
                        const exists = selectedIncentives.some(
                          (option) => option.value === item.value
                        );

                        if (!exists) {
                          setSelectedIncentives([
                            ...selectedIncentives,
                            {
                              value: item.value,
                              label: item.label,
                            },
                          ]);
                        }
                      }}
                    >
                      + {item.label}
                    </div>
                  ))}
                </div> */}
              </div>
            </>
          )}

          {/* NEXT BUTTON */}
          {activeTab === 0 && (
            <div className="form-group col-lg-12 d-flex justify-content-end mt-3">
              <button
                type="button"
                className="theme-btn btn-style-one"
                onClick={() => {
                  console.log(formData);
                  if (validationJobDetails()) {
                    setActiveTab(1);
                  }
                }}
              >
                Next
              </button>
            </div>
          )}

        </div >
      </form >

      <form className="default-form">
        <div className="row">

          {activeTab === 1 && (
            <>
              <div className="form-group col-lg-6 col-md-12">
                <label>Department  </label>
                <select
                  name="department"
                  value={formData.departmentId}
                  onChange={(e) => {
                    const selectedOption =
                      e.target.options[e.target.selectedIndex];

                    setFormData((prev) => ({
                      ...prev,
                      departmentId: e.target.value,
                      department: selectedOption.text, // option label
                    }));

                    getJobRoleByDepartment(e.target.value);

                    setErrors((prev) => ({
                      ...prev,
                      "department": "",
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      "departmentId": "",
                    }));

                  }}
                  className="chosen-single form-select"
                >
                  <option key="0" value="">Select Department</option>
                  {Object.entries(groupedDepartments).map(([category, items]) => (
                    <optgroup key={category} label={category}>
                      {items.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}


                </select>


                {errors.department && (
                  <span className="error-text">{errors.department}</span>
                )}
              </div>

              <div className="form-group col-lg-6 col-md-12">
                <label>Job Role  </label>
                <select
                  name="jobRole"
                  value={formData.jobRoleId}

                  onChange={(e) => {
                    const selectedOption =
                      e.target.options[e.target.selectedIndex];

                    setFormData((prev) => ({
                      ...prev,
                      jobRoleId: e.target.value,
                      jobRole: selectedOption.text,

                    }));

                    //getJobRole(e.target.value);

                    setErrors((prev) => ({
                      ...prev,
                      "jobRole": "",
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      "jobRoleId": "",
                    }));
                  }}

                  className="chosen-single form-select"
                >
                  <option value="">Select job role</option>
                  {jobRoleList.map((item) =>
                  (<option key={item.value} value={item.value}> {item.label}
                  </option>))}

                </select>

                {errors.jobRole && (
                  <span className="error-text">{errors.jobRole}</span>
                )}

              </div>

              <div className="form-group col-lg-6 col-md-12">
                <label>Job Location</label>

                <input
                  placeholder="Start typing to search location..."
                  type="text"
                  value={formData.jobLocation || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      jobLocation: e.target.value,
                    }));

                    getLocation(e.target.value);
                    setShowLocationList(true);

                    setErrors((prev) => ({
                      ...prev,
                      "jobLocation": "",
                    }));
                  }}
                />

                {showLocationList && locationList.length > 0 && (
                  <ul
                    style={{
                      position: "absolute",
                      width: "96%",
                      background: "#fff",
                      border: "1px solid rgb(185 198 239)",
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      maxHeight: "200px",
                      overflowY: "auto",
                      zIndex: 1000,
                    }}
                  >
                    {locationList.map((item) => (
                      <li
                        key={item.label}
                        style={{
                          padding: "4px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            jobLocation: item.label,
                            jobLocationId: item.value,
                          }));

                          setLocationList(false);
                        }}
                      >
                        <div style={{ paddingTop: "0px !important" }}>
                          {item.label}
                          <br></br><small className="text-muted ps-2">{item.label2}</small>
                        </div>

                      </li>
                    ))}
                  </ul>
                )}

                {errors.jobLocation && (
                  <span className="error-text">{errors.jobLocation}</span>
                )}
              </div>

              <div className="form-group col-lg-6 col-md-12">
                <label> Add Skills</label>
                <Select
                  isMulti
                  classNamePrefix="custom-select"
                  options={skills}
                  value={selectedSkills}
                  onChange={(selected) => {
                    const updated = (selected || []).map((item) => ({
                      ...item,
                      starred: item.starred || false,
                    }));

                    setSelectedSkills(updated);

                    setFormData((prev) => ({
                      ...prev,
                      skills: updated.map((item) => ({
                        skill: item.value,
                        starred: item.starred,
                      })),
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      skills: "",
                    }));
                  }}
                  components={{
                    MultiValueLabel: CustomMultiValueLabel,
                  }}
                />

                {/* <pre>
                  {JSON.stringify(formData.skills, null, 2)}
                </pre> */}


                {errors.skills && (
                  <span className="error-text">{errors.skills}</span>
                )}
              </div>
              <div className="form-group col-lg-6 col-md-12">
                <label> Candidate's industry you want to hire from    </label>
                <Select
                  isMulti
                  options={industry}

                  classNamePrefix="custom-select"
                  placeholder="Search for candidate industry..."

                  value={selectedIndustrys}
                  onChange={(selected) => {
                    const selectedOptions = selected || [];
                    setselectedIndustrys(selectedOptions);
                    const ids = (selected || []).map((item) => item.value);
                    setFormData((prev) => ({
                      ...prev,
                      industryIds: ids,
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      "industryIds": "",
                    }));
                  }}

                />
                {errors.industryIds && (
                  <span className="error-text">{errors.industryIds}</span>
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
                  <option value="">Select qualification</option>
                  <option value="10th">10th pass</option>
                  <option value="12th">12th pass</option>
                  <option value="Graduate">Graduate/Bachelor's Degree</option>
                  <option value="Masters">Master's Degree</option>
                  <option value="PhD">PhD</option>
                </select>
                {errors.qualification && (
                  <span className="error-text">{errors.qualification}</span>
                )}
              </div>

              <div className="form-group col-lg-6 col-md-12">
                <label>Educational Degree {isEnabled} <span style={{ fontSize: "12px", color: "#999" }}>(Optional)</span></label>
                <input
                  disabled={isEnabled === false}
                  placeholder="Start typing to search courses..."
                  type="text"
                  value={formData.degree || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      degree: e.target.value,
                    }));

                    getDegree(e.target.value);
                    setShowDegreeList(true);
                  }}
                />

                {showDegreeList && degreeList.length > 0 && (
                  <ul
                    style={{
                      position: "absolute",
                      width: "96%",
                      background: "#fff",
                      border: "1px solid rgb(185 198 239)",
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      maxHeight: "200px",
                      overflowY: "auto",
                      zIndex: 1000,
                    }}
                  >
                    {degreeList.map((item) => (
                      <li
                        key={item.value}
                        style={{
                          padding: "4px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            degree: item.label,
                            degreeId: item.value,
                          }));

                          setShowDegreeList(false);
                        }}
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>
                )}

              </div>

              <div className="form-group col-lg-6 col-md-12">
                <label>Degree Specification <span style={{ fontSize: "12px", color: "#999" }}>(Optional)</span></label>
                <input
                  disabled={isEnabled === false}
                  placeholder="Start typing to search specializations..."
                  type="text"
                  value={formData.specialization || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      specialization: e.target.value,
                    }));

                    getSpecialization(e.target.value);
                    setShowSpecializationList(true);
                  }}
                />

                {showSpecializationList && SpecializationList.length > 0 && (
                  <ul
                    style={{
                      position: "absolute",
                      width: "96%",
                      background: "#fff",
                      border: "1px solid rgb(185 198 239)",
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      maxHeight: "200px",
                      overflowY: "auto",
                      zIndex: 1000,
                    }}
                  >
                    {SpecializationList.map((item) => (
                      <li
                        key={item.key}
                        style={{
                          padding: "4px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            specialization: item.value,
                            specializationId: item.key,

                          }));

                          setShowSpecializationList(false);
                        }}
                      >
                        {item.value}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="form-group col-lg-6 col-md-12">
                <label>Languages Known <span style={{ fontSize: "12px", color: "#999" }}>(Optional)</span></label>
                <Select
                  // defaultValue={languages[2]}
                  isMulti
                  name="colors"
                  options={languages}
                  classNamePrefix="custom-select"

                  value={selectedLanguages}
                  onChange={(selected) => {
                    const selectedOptions = selected || [];
                    setselectedLanguages(selectedOptions);

                    setFormData((prev) => ({
                      ...prev,
                      languages: selectedOptions
                        ? selectedOptions.map((item) => item.label)
                        : [],
                      languagesId: selectedOptions
                        ? selectedOptions.map((item) => item.value)
                        : [],
                    }));
                  }}
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
                      if (validationCandidateDetails()) {
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
      </form >

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
                          setQuestions(updated);
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
                        setQuestions(updated);
                      }}
                    />

                    {questions.length > 1 && (
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => {
                          const updated = questions.filter(
                            (_, i) => i !== index
                          );

                          setQuestions(updated);
                        }}
                      >
                        ✕
                      </button>
                    )}

                  </div>
                  {errors[`question_${index}`] && (
                    <span className="error-text"> {errors[`question_${index}`]}</span>
                  )}

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
                        updated[index].preferredAnswer = "";

                        if (e.target.value === "options") {
                          updated[index].options = [""];
                        } else {
                          updated[index].options = [];
                        }

                        setQuestions(updated);
                      }}
                    >
                      <option value="text">Type Answer</option>
                      <option value="yesno">Yes / No</option>
                      <option value="options">Multiple Choice</option>
                    </select>
                  </div>
                  {/* Preferred Answer for Text */}
                  {q.type === "text" && (
                    <div className="mt-3">
                      <label>Preferred Answer</label>
                      <input
                        type="text"
                        className={`form-control ${errors[`preferred_${index}`]
                          ? "is-invalid"
                          : ""
                          }`}
                        placeholder="Enter preferred answer"
                        value={q.preferredAnswer || ""}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[index].preferredAnswer = e.target.value;
                          setQuestions(updated);
                        }}
                      />
                      {errors[`preferred_${index}`] && (
                        <span className="error-text">
                          {errors[`preferred_${index}`]}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Preferred Answer for Yes/No */}
                  {q.type === "yesno" && (
                    <div className="mt-3">
                      <label>Preferred Answer</label>
                      <select
                        className={`form-select ${errors[`preferred_${index}`]
                          ? "is-invalid"
                          : ""
                          }`}
                        value={q.preferredAnswer || ""}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[index].preferredAnswer = e.target.value;
                          setQuestions(updated);
                        }}
                      >
                        <option value="">Select Preferred Answer</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      {errors[`preferred_${index}`] && (
                        <span className="error-text">
                          {errors[`preferred_${index}`]}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Preferred Answer for Multi Option */}
                  {q.type === "options" && (
                    <div className="mt-3">
                      <label>Preferred Option</label>
                      <select
                        className={`form-select ${errors[`preferred_${index}`]
                          ? "is-invalid"
                          : ""
                          }`}
                        value={q.preferredAnswer || ""}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[index].preferredAnswer = e.target.value;
                          setQuestions(updated);
                        }}
                      >
                        <option value="">Select Preferred Option</option>

                        {q.options.map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {errors[`preferred_${index}`] && (
                        <span className="error-text">
                          {errors[`preferred_${index}`]}
                        </span>
                      )}
                    </div>
                  )}


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
                              setQuestions(updated);
                            }}
                          />

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
                          setQuestions(updated);
                        }}
                      >
                        + Add Option
                      </button>
                      {errors[`options_${index}`] && (
                        <span className="error-text">
                          {errors[`options_${index}`]}
                        </span>
                      )}
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
                        preferredAnswer: "",
                      }
                    ];

                    setQuestions(updated);
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
                          preferredAnswer: "",
                        }
                      ];

                      setQuestions(updated);
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

                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={formData.jobDesc}
                  onChange={handleJobDescriptionChange}
                  modules={modules}
                  formats={formats}
                  placeholder="Write job description..."
                />
                <div
                  style={{
                    textAlign: "right",
                    fontSize: "12px",
                    marginTop: "5px",
                    color: charCount < 500 ? "red" : "green",
                  }}
                >
                  {charCount}/500 minimum characters
                </div>
                {errors.jobDesc && (
                  <span className="text-danger small">
                    {errors.jobDesc}
                  </span>
                )}
              </div>


              {/* About Company */}
              <div className="form-group col-lg-12">
                <label>
                  About Company
                  <span style={{ fontSize: "12px", color: "#999" }}>
                    (Optional)
                  </span>
                </label>

                <textarea
                  className=" about-input-company"
                  maxLength={250}
                  value={formData.aboutCompany}
                  onChange={handleCompanyDescChange}
                  placeholder="Write about your company, culture, values..."
                />

                <div
                  className="text-end text-red mt-1"
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
                      if (validationJobDesc()) {
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
      </form >

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
                      className={`chip ${formData.allowDirectCall === option.label
                        ? "active"
                        : ""
                        }`}
                      onClick={() => {
                        setFormData((prev) => ({
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
                      className={`chip ${formData.contactMethod === method.label ? "active" : ""
                        }`}
                      onClick={() => {
                        setFormData((prev) => ({
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
                  name="cemail"
                  value={formData.cemail}
                  onChange={handleContactChange}
                  className={`form-control ${errors.cemail ? "error-border" : ""}`}
                  placeholder="example@gmail.com"
                />

                {errors.cemail && (
                  <span className="error-text">{errors.cemail}</span>
                )}
              </div>

              {/* Contact Number */}

              <div className="form-group col-lg-6 col-md-12">
                <label>Contact Number</label>

                <div className="phone-input">
                  <span className="country-code">+91</span>

                  <input
                    style={{ border: "0px" }}
                    type="tel"
                    value={formData.cphone || ""}
                    //onChange={handleChange}

                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, cphone: value });
                    }}

                    placeholder="Enter 10-digit contact number"
                    maxLength={10}

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
                  <div className="col-6">
                    <input
                      type="time"
                      className={`form-control ${errors.callFrom ? "error-border" : ""}`}
                      name="callFrom"
                      value={formData.callFrom || ""}
                      onChange={handleContactChange}
                    />
                    {errors.callFrom && (
                      <span className="error-text">{errors.callFrom}</span>
                    )}
                  </div ><div className="col-6">
                    <input
                      type="time"
                      className={`form-control ${errors.callTo ? "error-border" : ""}`}
                      name="callTo"
                      value={formData.callTo || ""}
                      onChange={handleContactChange}
                    />
                    {errors.callTo && (
                      <span className="error-text">{errors.callTo}</span>
                    )}
                  </div>
                </div>


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
                  value={formData.applicationMethod || ""}
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
              {/* <div className="form-group col-lg-6">
                <label>
                  External Application Link <span>(Optional)</span>
                </label>
                <input
                  type="text"
                  name="externalLink"
                  value={formData.externalLink || ""}
                  onChange={handleContactChange}
                  className={`form-control ${errors.externalLink ? "error-border" : ""
                    }`}
                  placeholder="https://yourcompany.com/apply"
                />

                
            </div> */}

              {/* Notifications */}
              {/* <div className="form-group col-lg-12">
                <label>Notifications</label>

                <div className="d-flex gap-3">
                  <label>
                    <input type="checkbox" id="emailNotify" /> Email Notifications
                  </label>

                  <label>
                    <input type="checkbox" id="smsNotify" /> SMS Notifications
                  </label>
                </div>
              </div> */}

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
                  <button type="button"
                    className="btn submit-btn"
                    disabled={loading}
                    onClick={handleSubmit}
                  >
                    {loading ? "Submitting..." : "Submit KYC"}
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
