'use client'
import Select from "react-select";
import { useState, useRef, useEffect } from "react";

import { FaMale, FaFemale } from "react-icons/fa";
import { MdOutlineTransgender } from "react-icons/md";


import { statesData } from '../../../../../../data/states';

const FormInfoBox = ({ formData,
  setFormData,
  errors,
  setErrors, }) => {

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "email"
          ? value.replace(/\s/g, "")
          : value,
    }));
  };

  const catOptions = [
    { value: "Banking", label: "Banking" },
    { value: "Digital & Creative", label: "Digital & Creative" },
    { value: "Retail", label: "Retail" },
    { value: "Human Resources", label: "Human Resources" },
    { value: "Managemnet", label: "Managemnet" },
    { value: "Accounting & Finance", label: "Accounting & Finance" },
    { value: "Digital", label: "Digital" },
    { value: "Creative Art", label: "Creative Art" },
  ];
  const genders = [
    { label: "Female", icon: <FaFemale /> },
    { label: "Male", icon: <FaMale /> },
    { label: "Others", icon: <MdOutlineTransgender /> },
  ];


  const types = [
    "College student",
    "Fresher",
    "Working professional",
    "School student",
    "Woman returning to work",
  ];

  const streamOptions = [
    { value: "cs", label: "Computer Science" },
    { value: "it", label: "Information Technology" },
    { value: "mech", label: "Mechanical" },
    { value: "civil", label: "Civil" },
    { value: "electronics", label: "Electronics" },
    { value: "commerce", label: "Commerce" },
    { value: "arts", label: "Arts" },
  ];


  const allLanguages = [
    "English",
    "Hindi",
    "Marathi",
    "Gujarati",
    "Punjabi",
    "Bengali",
    "Tamil",
    "Telugu",
    "Kannada",
    "Malayalam",
    "Urdu",
    "French",
    "German",
    "Spanish",
    "Japanese",
    "Chinese",
    "Arabic",
    "Russian",
    "Portuguese",
    "Italian",
    "Korean",
  ];

  const courseRef = useRef(null);

  const [selectedGender, setSelectedGender] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState(
    formData.languages || []
  );
  const [selectedType, setSelectedType] = useState("");
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [showCourseSearch, setShowCourseSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStream, setSelectedStream] = useState(null);
  const [experience, setExperience] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [careerGoals, setCareerGoals] = useState([]);

  const [university, setUniversity] = useState("");
  const [universityList, setUniversityList] = useState([]);
  const [showUniversityList, setShowUniversityList] = useState(false);

  const currentYear = new Date().getFullYear();

  const [showLanguageSearch, setShowLanguageSearch] = useState(false);
  const [languageSearch, setLanguageSearch] = useState("");

  const [languageData, setLanguageData] = useState([
    {
      language: "English",
      read: false,
      write: false,
      speak: false,
    },
  ]);

  const addLanguage = (lang) => {
    if (
      languageData.some(
        (item) => item.language === lang
      )
    ) {
      return;
    }

    setLanguageData((prev) => [
      ...prev,
      {
        language: lang,
        read: false,
        write: false,
        speak: false,
      },
    ]);

    setShowLanguageSearch(false);
  };

  const toggleLanguageSkill = (
    language,
    skill
  ) => {
    const updated = languageData.map((item) =>
      item.language === language
        ? {
          ...item,
          [skill]: !item[skill],
        }
        : item
    );

    setLanguageData(updated);

    setFormData((prev) => ({
      ...prev,
      languages: updated,
    }));
  };



  const filteredLanguages = allLanguages.filter(
    (lang) =>
      lang.toLowerCase().includes(languageSearch.toLowerCase()) &&
      !languageData.some((item) => item.language === lang)
  );


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        courseRef.current &&
        !courseRef.current.contains(event.target)
      ) {
        setShowCourseSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);
  useEffect(() => {
    const stateList = Object.keys(statesData).sort();
    setStates(stateList);
  }, []);

  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setSelectedCity(''); // Reset city

    if (state && statesData[state]) {
      setCities([...statesData[state]].sort());
    } else {
      setCities([]);
    }
  };

  const allCourses = [
    "B.Tech",
    "BE",
    "B.Com",
    "MBA",
    "B.A",
    "BCA",
    "MCA",
    "BSc",
    "MSc",
    "PhD",
  ];

  const getUniversities = async (term) => {
    if (!term || term.length < 2) {
      setUniversityList([]);
      return;
    }

    console.log("Fetching universities for term:", term);


    try {

      const response = await fetch("/api/university-search-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: term,
        }),
      });

      const data = await response.json();
      console.log("Universities fetched:", JSON.stringify(data));

      setUniversityList(data && data.data ? data.data : []);
      setShowUniversityList(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (

    <form action="#" className="default-form" >
      <div className="row">
        {/* <!-- Input --> */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName || ""}
            onChange={handleChange}
            maxLength={30}
          />
          {errors.fullName && (
            <span className="error-text">{errors.fullName}</span>
          )}
        </div>


        <div className="form-group col-lg-6 col-md-12">
          <label>Email address</label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            maxLength={50}
            placeholder="Email"
          />
          {errors.email && (
            <span className="error-text">{errors.email}</span>
          )}
        </div>


        <div className="form-group col-lg-6 col-md-12">
          <label>Mobile Number</label>

          <div className="phone-input">
            <span className="country-code">+91</span>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Mobile Number"
              maxLength={10}

            />

          </div>
          {errors.phone && (
            <span className="error-text">{errors.phone}</span>
          )}
        </div>


        <div className="form-group col-lg-6 col-md-12">
          <label>Date of Birth</label>
          <div >

            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              placeholder="Date of Birth"
              maxLength={10}
            />

          </div>
          {errors.dob && (
            <span className="error-text">{errors.dob}</span>
          )}
        </div>

        <div className="form-group col-lg-6">
          <label>State</label>
          <select
            id="state"
            className="form-select "
            value={selectedState}

            onChange={(e) => {
              const value = e.target.value;

              handleStateChange(e);
              setSelectedCity("");

              setFormData((prev) => ({
                ...prev,
                state: value,
                city: "",
              }));

              setErrors((prev) => ({
                ...prev,
                state: "",
                city: "",
              }));
            }}


          >
            <option value="">-- Select State --</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && (
            <span className="error-text">{errors.state}</span>
          )}
        </div>

        <div className="form-group col-lg-6">
          <label>City</label>
          <select
            id="city"
            className="form-select "
            value={selectedCity}
            onChange={(e) => {
              const value = e.target.value;

              setSelectedCity(value);

              setFormData((prev) => ({
                ...prev,
                city: value,
              }));

              setErrors((prev) => ({
                ...prev,
                city: "",
              }));
            }}
            disabled={!selectedState}
          >
            <option value="">-- Select City --</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.city && (
            <span className="error-text">{errors.city}</span>
          )}
        </div>

        <div className="form-group col-lg-12 col-md-12">
          <label>Complete Address</label>
          <input

            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Complete Address"
            maxLength={100}
          />
          {errors.address && (
            <span className="error-text">{errors.address}</span>
          )}
        </div>

        <div className="form-container">

          {/* GENDER */}
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


          {/* LANGUAGES */}
          <div className="form-group col-lg-12">
            <label>Languages</label>

            {languageData.map((item, index) => (
              <div
                key={index}
                className="language-row"
              >
                <div className="language-name">
                  {item.language}
                </div>

                <label className="skill-check">
                  <input
                    type="checkbox"
                    checked={item.read}
                    onChange={() =>
                      toggleLanguageSkill(
                        item.language,
                        "read"
                      )
                    }
                  />
                  Read
                </label>

                <label className="skill-check">
                  <input
                    type="checkbox"
                    checked={item.write}
                    onChange={() =>
                      toggleLanguageSkill(
                        item.language,
                        "write"
                      )
                    }
                  />
                  Write
                </label>

                <label className="skill-check">
                  <input
                    type="checkbox"
                    checked={item.speak}
                    onChange={() =>
                      toggleLanguageSkill(
                        item.language,
                        "speak"
                      )
                    }
                  />
                  Speak
                </label>

                {index > 0 && (
                  <button
                    type="button"
                    className="remove-language"
                    onClick={() => {
                      const updated =
                        languageData.filter(
                          (_, i) => i !== index
                        );

                      setLanguageData(updated);

                      setFormData((prev) => ({
                        ...prev,
                        languages: updated,
                      }));
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="add-language-btn"
              onClick={() => setShowLanguageSearch(prev => !prev)}
            >
              + Add Language
            </button>

            {showLanguageSearch && (
              <div className="language-search-wrapper">
                <input
                  type="text"
                  className="language-search-input"
                  placeholder="Search language..."
                  value={languageSearch}
                  onChange={(e) => setLanguageSearch(e.target.value)}
                />

                <div className="language-dropdown-list">
                  {filteredLanguages.map((lang, index) => (
                    <div
                      key={index}
                      className="language-dropdown-item"
                      onClick={() => addLanguage(lang)}
                    >
                      {lang}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* {errors.languages && (
              <span className="error-text">{errors.languages}</span>
            )} */}


          {/* TYPE */}
          <div className="row mt-3">
            <div className="form-group  col-md-12">
              <label>Education</label>

              <div className="chip-container">
                {[
                  "10th",
                  "12th",
                  "Graduate/Diploma",
                  "Post Graduate/Master's",
                  "Doctorate/PhD",
                ].map((type) => (
                  <div
                    key={type}
                    className={`chip ${selectedType === type ? "active" : ""}`}
                    onClick={() => {
                      setSelectedType(type);

                      setFormData((prev) => ({
                        ...prev,
                        type,
                      }));

                      setErrors((prev) => ({
                        ...prev,
                        type: "",
                      }));
                    }}
                  >
                    {type}
                  </div>
                ))}
              </div>

              {errors.type && (
                <span className="error-text">{errors.type}</span>
              )}
            </div>
          </div>


          {selectedType === "10th" && (
            <div className="row mt-3">

              {/* Board */}
              <div className="form-group col-md-6">
                <label>Board</label>
                <select
                  className={`form-select ${errors.tenthBoard ? "error-field" : ""}`}
                  value={formData.tenthBoard || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      tenthBoard: e.target.value,
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      tenthBoard: "",
                    }));
                  }}
                >
                  <option value="">Select Board</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                  <option value="NIOS">NIOS</option>
                  <option value="Other">Other</option>
                </select>

                {errors.tenthBoard && (
                  <span className="error-text">{errors.tenthBoard}</span>
                )}


              </div>

              {/* Passing Year */}
              <div className="form-group col-md-6">
                <label>Passing Out Year</label>

                <select
                  className={`form-select ${errors.tenthPassingYear ? "error-field" : ""
                    }`}
                  value={formData.tenthPassingYear || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      tenthPassingYear: e.target.value,
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      tenthPassingYear: "",
                    }));
                  }}
                >
                  <option value="">Select Year</option>

                  {Array.from(
                    { length: new Date().getFullYear() - 1990 + 1 },
                    (_, i) => {
                      const year = new Date().getFullYear() - i;

                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    }
                  )}
                </select>

                {errors.tenthPassingYear && (
                  <span className="error-text">
                    {errors.tenthPassingYear}
                  </span>
                )}
              </div>

              {/* School Medium */}
              <div className="form-group col-md-6">
                <label>School Medium</label>

                <select
                  className={`form-select ${errors.tenthMedium ? "error-field" : ""
                    }`}
                  value={formData.tenthMedium || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      tenthMedium: e.target.value,
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      tenthMedium: "",
                    }));
                  }}
                >
                  <option value="">Select Medium</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Other">Other</option>
                </select>

                {errors.tenthMedium && (
                  <span className="error-text">{errors.tenthMedium}</span>
                )}
              </div>

              {/* Marks */}
              <div className="form-group col-md-6">
                <label>Marks (%)</label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Enter Percentage"
                  className={errors.tenthMarks ? "error-field" : ""}
                  value={formData.tenthMarks || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      tenthMarks: e.target.value,
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      tenthMarks: "",
                    }));
                  }}
                />

                {errors.tenthMarks && (
                  <span className="error-text">{errors.tenthMarks}</span>
                )}
              </div>

            </div>
          )}
          {selectedType === "12th" && (
            <div className="row mt-3">

              {/* Board */}
              <div className="form-group col-md-6">
                <label>Board</label>
                <select
                  className={`form-select ${errors.twelfthBoard ? "error-field" : ""}`}
                  value={formData.twelfthBoard || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      twelfthBoard: e.target.value,
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      twelfthBoard: "",
                    }));
                  }}
                >
                  <option value="">Select Board</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                  <option value="NIOS">NIOS</option>
                </select>

                {errors.twelfthBoard && (
                  <span className="error-text">{errors.twelfthBoard}</span>
                )}
              </div>

              {/* Passing Year */}
              <div className="form-group col-md-6">
                <label>Passing Out Year</label>

                <select
                  className={`form-select ${errors.twelfthPassingYear ? "error-field" : ""
                    }`}
                  value={formData.twelfthPassingYear || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      twelfthPassingYear: e.target.value,
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      twelfthPassingYear: "",
                    }));
                  }}
                >
                  <option value="">Select Year</option>

                  {Array.from(
                    { length: new Date().getFullYear() - 1990 + 1 },
                    (_, i) => {
                      const year = new Date().getFullYear() - i;

                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    }
                  )}
                </select>

                {errors.twelfthPassingYear && (
                  <span className="error-text">
                    {errors.twelfthPassingYear}
                  </span>
                )}
              </div>

              {/* Stream */}
              <div className="form-group col-md-6">
                <label>Stream</label>

                <select
                  className={`form-select ${errors.twelfthStream ? "error-field" : ""
                    }`}
                  value={formData.twelfthStream || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      twelfthStream: e.target.value,
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      twelfthStream: "",
                    }));
                  }}
                >
                  <option value="">Select Stream</option>
                  <option value="Science">Science</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                  <option value="Vocational">Vocational</option>
                </select>

                {errors.twelfthStream && (
                  <span className="error-text">{errors.twelfthStream}</span>
                )}
              </div>

              {/* Marks */}
              <div className="form-group col-md-6">
                <label>Marks (%)</label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Enter Percentage"
                  className={errors.twelfthMarks ? "error-field" : ""}
                  value={formData.twelfthMarks || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      twelfthMarks: e.target.value,
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      twelfthMarks: "",
                    }));
                  }}
                />

                {errors.twelfthMarks && (
                  <span className="error-text">{errors.twelfthMarks}</span>
                )}
              </div>

            </div>
          )}


          {(
            selectedType === "Graduate/Diploma" ||
            selectedType === "Post Graduate/Master's" ||
            selectedType === "Doctorate/PhD"
          ) && (
              <div className="row mt-3">


                <div style={{ position: "relative" }} className="form-group col-md-6">
                  <label>University / Institute</label>
                  <input
                    type="text"
                    value={formData.graduateUniversity || ""}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        graduateUniversity: e.target.value,
                      }));

                      getUniversities(e.target.value);
                      setShowUniversityList(true);
                    }}
                  />

                  {showUniversityList && universityList.length > 0 && (
                    <ul
                      style={{
                        position: "absolute",
                        width: "100%",
                        background: "#fff",
                        border: "1px solid #ccc",
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 1000,
                      }}
                    >
                      {universityList.map((item) => (
                        <li
                          key={item.key}
                          style={{
                            padding: "8px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              graduateUniversity: item.value,
                            }));

                            setShowUniversityList(false);
                          }}
                        >
                          {item.value}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* University */}
                {/* <div className="form-group col-lg-12">
                  <label>University / Institute</label>
                  <input
                    type="text"
                    value={formData.graduateUniversity || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        graduateUniversity: e.target.value,
                      }))
                    }
                  />
 
                  {errors.graduateUniversity && (
                    <span className="error-text">
                      {errors.graduateUniversity}
                    </span>
                  )}
                </div> */}

                {/* Course */}
                <div className="form-group col-md-6">
                  <label>Course</label>
                  <select
                    className="form-select"
                    value={formData.graduateCourse || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        graduateCourse: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Course</option>
                    <option>B.Tech</option>
                    <option>BCA</option>
                    <option>B.Com</option>
                    <option>B.Sc</option>
                    <option>Diploma</option>
                    <option>BBA</option>
                    <option>BA</option>
                  </select>
                  {errors.graduateCourse && (
                    <span className="error-text">
                      {errors.graduateCourse}
                    </span>
                  )}
                </div>

                {/* Specialization */}
                <div className="form-group col-md-6">
                  <label>Specialization</label>
                  <select
                    className="form-select"
                    value={formData.graduateSpecialization || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        graduateSpecialization: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Specialization</option>
                    <option>Computer Science</option>
                    <option>Information Technology</option>
                    <option>Mechanical Engineering</option>
                    <option>Civil Engineering</option>
                    <option>Electronics</option>
                    <option>Commerce</option>
                  </select>
                  {errors.graduateSpecialization && (
                    <span className="error-text">
                      {errors.graduateSpecialization}
                    </span>
                  )}
                </div>

                {/* Course Type */}
                <div className="form-group col-lg-12">
                  <label>Course Type</label>

                  <div className="course-type-group">
                    {[
                      "Full Time",
                      "Part Time",
                      "Distance Learning",
                    ].map((type) => (
                      <label key={type} className="radio-option">
                        <input
                          type="radio"
                          name="courseType"
                          checked={
                            formData.graduateCourseType === type
                          }
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              graduateCourseType: type,
                            }))
                          }
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                  {errors.graduateCourseType && (
                    <span className="error-text">
                      {errors.graduateCourseType}
                    </span>
                  )}
                </div>

                {/* Duration */}
                <div className="form-group col-md-6">
                  <label>Starting Year</label>

                  <select
                    className="form-select"
                    value={formData.graduateStartYear || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        graduateStartYear: e.target.value,
                      }))
                    }
                  >
                    <option value="">Starting Year</option>

                    {Array.from({ length: 20 }, (_, i) => {
                      const year = 2010 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                  {errors.graduateStartYear && (
                    <span className="error-text">
                      {errors.graduateStartYear}
                    </span>
                  )}
                </div>

                <div className="form-group col-md-6">
                  <label>Ending Year</label>

                  <select
                    className="form-select"
                    value={formData.graduateEndYear || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        graduateEndYear: e.target.value,
                      }))
                    }
                  >
                    <option value="">Ending Year</option>

                    {Array.from({ length: 20 }, (_, i) => {
                      const year = 2010 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                  {errors.graduateEndYear && (
                    <span className="error-text">
                      {errors.graduateEndYear}
                    </span>
                  )}
                </div>

                {/* Grading System */}
                <div className="form-group col-md-6">
                  <label>Grading System</label>

                  <select
                    className="form-select"
                    value={formData.graduateGradingSystem || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        graduateGradingSystem: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Grading System</option>
                    <option>Percentage</option>
                    <option>CGPA</option>
                    <option>GPA</option>
                  </select>
                  {errors.graduateGradingSystem && (
                    <span className="error-text">
                      {errors.graduateGradingSystem}
                    </span>
                  )}
                </div>

                {/* Score */}
                <div className="form-group col-md-6">
                  <label>Percentage / CGPA</label>

                  <input
                    type="text"
                    placeholder="Enter score"
                    value={formData.graduateScore || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        graduateScore: e.target.value,
                      }))
                    }
                  />
                  {errors.graduateScore && (
                    <span className="error-text">
                      {errors.graduateScore}
                    </span>
                  )}
                </div>

              </div>
            )}


        </div>
      </div>
    </form >
  );
};

export default FormInfoBox;
