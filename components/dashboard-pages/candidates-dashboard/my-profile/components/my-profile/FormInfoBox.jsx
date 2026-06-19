'use client'
import Select from "react-select";
import { useState, useEffect } from "react";

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

  const genders = [
    { label: "Male", icon: <FaMale /> },
    { label: "Female", icon: <FaFemale /> },
    { label: "Others", icon: <MdOutlineTransgender /> },
  ];



  const [selectedGender, setSelectedGender] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState(
    formData.languages || []
  );
  const [selectedType, setSelectedType] = useState("");
  const [selectedType2, setSelectedType2] = useState("");
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");

  const [universityList, setUniversityList] = useState([]);
  const [showUniversityList, setShowUniversityList] = useState(false);

  const [languages, setLanguages] = useState([]);


  const [courseList, setCourseList] = useState([]);
  const [showCourseList, setShowCourseList] = useState(false);

  const [SpecializationList, setSpecializationList] = useState([]);
  const [showSpecializationList, setShowSpecializationList] = useState(false);

  const currentYear = new Date().getFullYear();

  const [showLanguageSearch, setShowLanguageSearch] = useState(false);
  const [languageSearch, setLanguageSearch] = useState("");
  const [languageData, setLanguageData] = useState([
    {
      id: 1,
      language: "English",
      read: false,
      write: false,
      speak: false,
    },
  ]);

  useEffect(() => {
    handleStateChange(formData.state);
    setSelectedCity(formData.city);
    setSelectedGender(formData.gender);
    setSelectedType(formData.type);

    if (formData.languageString) {
      setLanguageData(
        parseLanguageString(formData.languageString)
      );
    }

  }, [formData.state, formData.languageString]);

  const parseLanguageString = (languageString) => {
    if (!languageString) return [];

    return languageString
      .split("#")
      .filter(item => item.trim() !== "")
      .map(item => {
        const [id, language, read, write, speak] = item.split("^");

        return {
          id: Number(id),
          language,
          read: read === "1",
          write: write === "1",
          speak: speak === "1",
        };
      });
  };

  const addLanguage = (key, lang) => {
    // Check if language already exists
    const exists = languageData.some(
      (item) => item.id === key
    );

    if (exists) {
      console.log("Language already added");
      return;
    }

    const newLanguage = {
      id: key,
      language: lang,
      read: false,
      write: false,
      speak: false,
    };

    const updated = [...languageData, newLanguage];

    setLanguageData(updated);

    setFormData((prev) => ({
      ...prev,
      languages: updated.map((item) => ({
        language_id: item.id,
        language: item.language,
        read: item.read ? 1 : 0,
        write: item.write ? 1 : 0,
        speak: item.speak ? 1 : 0,
      })),
    }));

    console.log(updated);

    setShowLanguageSearch(false);
    setLanguageSearch("");
  };

  const toggleLanguageSkill = (languageId, skill) => {
    const updated = languageData.map((item) =>
      item.id === languageId
        ? {
          ...item,
          [skill]: !item[skill],
        }
        : item
    );

    setLanguageData(updated);

    const apiLanguages = updated.map((lang) => ({
      language_id: lang.id,
      language: lang.language,
      read: lang.read ? 1 : 0,
      write: lang.write ? 1 : 0,
      speak: lang.speak ? 1 : 0,
    }));

    setFormData((prev) => ({
      ...prev,
      languages: apiLanguages,
    }));
    console.log(apiLanguages);
    console.log("API Language Data");
    console.log(apiLanguages);

    const languageString =
      updated
        .map(
          lang =>
            `${lang.id}^${lang.language}^${lang.read ? 1 : 0}^${lang.write ? 1 : 0}^${lang.speak ? 1 : 0}`
        )
        .join("#") + "#";
    setFormData((prev) => ({
      ...prev,
      languageString: languageString,
    }));
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
      //console.log("Languages fetched:", JSON.stringify(data.data));

      setLanguages(data && data.data ? data.data : []);

    } catch (error) {
      console.error(error);
    }
  };


  const filteredLanguages = languages.filter(
    (lang) =>
      lang.value
        .toLowerCase()
        .includes(languageSearch.toLowerCase()) &&
      !languageData.some(
        (selected) => selected.key === lang.key
      )
  );

  useEffect(() => {
    getLanguages();
    const stateList = Object.keys(statesData).sort();
    setStates(stateList);
  }, []);

  const handleStateChange = (eOrValue) => {
    const state =
      typeof eOrValue === "string"
        ? eOrValue
        : eOrValue.target.value;

    setSelectedState(state);
    setSelectedCity(""); // Reset city

    if (state && statesData[state]) {
      setCities([...statesData[state]].sort());
    } else {
      setCities([]);
    }
  };

  // const getUniversities = async (term) => {
  //   if (!term || term.length < 2) {
  //     setUniversityList([]);
  //     return;
  //   }
  //   //console.log("Fetching universities for term:", term);
  //   try {

  //     const response = await fetch("/api/list-university-search", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         term: term,
  //       }),
  //     });

  //     const data = await response.json();
  //     //console.log("Universities fetched:", JSON.stringify(data));

  //     setUniversityList(data && data.data ? data.data : []);
  //     setShowUniversityList(true);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };


  // const getCourses = async (term) => {
  //   if (!term || term.length < 2) {
  //     setCourseList([]);
  //     return;
  //   }
  //   //console.log("Fetching courses for term:", term);
  //   try {

  //     const response = await fetch("/api/list-courses-search", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         term: term,
  //         eduType: selectedType2,
  //       }),
  //     });

  //     const data = await response.json();
  //     //console.log("Courses fetched:", JSON.stringify(data));

  //     setCourseList(data && data.data ? data.data : []);
  //     setShowCourseList(true);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // const getSpecialization = async (term) => {
  //   if (!term || term.length < 2) {
  //     setSpecializationList([]);
  //     return;
  //   }
  //   //console.log("Fetching Specialization for term:", term);
  //   try {

  //     const response = await fetch("/api/list-specialization-search", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         term: term,
  //         eduType: selectedType2,
  //         id: formData.graduateCourseId || "",
  //       }),
  //     });

  //     const data = await response.json();
  //     //console.log("Specializations fetched:", JSON.stringify(data));

  //     setSpecializationList(data && data.data ? data.data : []);
  //     setShowSpecializationList(true);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  return (

    <form action="#" className="default-form" >
      <div className="row">
        {/* <!-- Input --> */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Full Name</label>
          <input
            type="text"
            readOnly

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
            readOnly
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
              style={{ border: "0px" }}
              type="tel"
              readOnly
              value={formData.phone || ""}
              //onChange={handleChange}

              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setFormData({ ...formData, phone: value });
              }}

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
              max={currentYear - 18 + "-12-31"}
            />

          </div>
          {errors.dob && (
            <span className="error-text">{errors.dob}</span>
          )}
        </div>

        <div className="form-group col-lg-6">
          <label>State  </label>
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

        <div className="form-group col-lg-6  col-md-12">
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
        <div className="form-group col-lg-6 col-md-12">
          <label>Pin Code</label>
          <input

            type="tel"
            name="pincode"
            //value={formData.pincode}
            //onChange={handleChange}

            value={formData.pincode || ""}
            //onChange={handleChange}

            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setFormData({ ...formData, pincode: value });
            }}



            placeholder="Pin Code"
            maxLength={6}
          />
          {errors.pincode && (
            <span className="error-text">{errors.pincode}</span>
          )}
        </div>

        <div className="form-container">

          {/* GENDER */}
          <div className="form-group col-lg-6 col-md-12">
            <label>Gender</label>
            <div className="chip-container" style={{ marginTop: "0px" }}>
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
                        item.id,
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
                        item.id,
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
                        item.id,
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
                      const updated = languageData.filter(
                        (_, i) => i !== index
                      );

                      setLanguageData(updated);

                      setFormData((prev) => ({
                        ...prev,
                        languages: updated.map((lang) => ({
                          language_id: lang.key,
                          language: lang.value,
                          read: lang.read ? 1 : 0,
                          write: lang.write ? 1 : 0,
                          speak: lang.speak ? 1 : 0,
                        })),
                      }));

                      console.log(updated);
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
                      onClick={() => addLanguage(lang.key, lang.value)}
                    >
                      {lang.value}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* {errors.languages && (
              <span className="error-text">{errors.languages}</span>
            )} */}



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
                      let selectedValue = type;
                      setSelectedType(selectedValue);
                      if (type === "Graduate/Diploma") {
                        selectedValue = "Graduate";
                      } else if (type === "Post Graduate/Master's") {
                        selectedValue = "Masters";
                      } else if (type === "Doctorate/PhD") {
                        selectedValue = "PhD";
                      }

                      setSelectedType2(selectedValue);

                      setFormData((prev) => ({
                        ...prev,
                        type: selectedValue,
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


          {/* {selectedType === "10th" && (
            <div className="row mt-3">

              
              <div className="form-group col-md-6">
                <label>Board  </label>
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

                  <optgroup label="All India">
                    <option value="CBSE">CBSE</option>
                    <option value="CISCE(ICSE/ISC)">CISCE(ICSE/ISC)</option>
                    <option value="Diploma">Diploma</option>
                    <option value="National Open School">National Open School</option>
                    <option value="IB(International Baccalaureate)">IB(International Baccalaureate)</option>
                  </optgroup>

                  <optgroup label="State Boards">
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="J &amp; K">J &amp; K</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="West Bengal">West Bengal</option>
                  </optgroup>
                </select>

                {errors.tenthBoard && (
                  <span className="error-text">{errors.tenthBoard}</span>
                )}


              </div>

              
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
                  <option value="Assamese / Asomiya">		 Assamese / Asomiya	  </option>
                  <option value="Bengali / Bangla"> 		 Bengali / Bangla 		  </option>
                  <option value="English"> 				 English 				  </option>
                  <option value="Gujarati"> 				 Gujarati 				  </option>
                  <option value="Hindi"> 					 Hindi 				  </option>
                  <option value="Kannada"> 				 Kannada 				  </option>
                  <option value="Kashmiri"> 				 Kashmiri 				  </option>
                  <option value="Konkani"> 				 Konkani 				  </option>
                  <option value="Malayalam"> 				 Malayalam 			  </option>
                  <option value="Manipuri"> 				 Manipuri 				  </option>
                  <option value="Marathi"> 				 Marathi 				  </option>
                  <option value="Oriya"> 					 Oriya 				  </option>
                  <option value="Punjabi"> 				 Punjabi 				  </option>
                  <option value="Sanskrit"> 				 Sanskrit 				  </option>
                  <option value="Tamil"> 					 Tamil 				  </option>
                  <option value="Telugu"> 					 Telugu 			  </option>
                  <option value="Urdu"> 					 Urdu 					  </option>
                </select>

                {errors.tenthMedium && (
                  <span className="error-text">{errors.tenthMedium}</span>
                )}
              </div>

             
              <div className="form-group col-md-6">
                <label>Marks (%)</label>

                <input
                  type="tel"
                  min="0"
                  max="3"
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

                  <optgroup label="All India">
                    <option value="CBSE">CBSE</option>
                    <option value="CISCE(ICSE/ISC)">CISCE(ICSE/ISC)</option>
                    <option value="Diploma">Diploma</option>
                    <option value="National Open School">National Open School</option>
                    <option value="IB(International Baccalaureate)">IB(International Baccalaureate)</option>
                  </optgroup>

                  <optgroup label="State Boards">
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="J &amp; K">J &amp; K</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="West Bengal">West Bengal</option>
                  </optgroup>
                </select>

                {errors.twelfthBoard && (
                  <span className="error-text">{errors.twelfthBoard}</span>
                )}
              </div>

             
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
            selectedType2 === "Graduate" ||
            selectedType2 === "Masters" ||
            selectedType2 === "PhD"
          ) && (
              <div className="row mt-3">

                <div style={{ position: "relative" }} className="form-group col-md-6">
                  <label>University / Institute   </label>
                  <input
                    placeholder="Start typing to search universities..."
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
                      {universityList.map((item) => (
                        <li
                          key={item.key}
                          style={{
                            padding: "4px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              graduateUniversity: item.value,
                              graduateUniversityId: item.key,
                            }));

                            setShowUniversityList(false);
                          }}
                        >
                          {item.value}
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.graduateUniversity && (
                    <span className="error-text">
                      {errors.graduateUniversity}
                    </span>
                  )}
                </div>

               
                <div style={{ position: "relative" }} className="form-group col-md-6">
                  <label>Course  </label>
                  <input
                    placeholder="Start typing to search courses..."
                    type="text"
                    value={formData.graduateCourse || ""}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        graduateCourse: e.target.value,
                      }));

                      getCourses(e.target.value);
                      setShowCourseList(true);
                    }}
                  />

                  {showCourseList && courseList.length > 0 && (
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
                      {courseList.map((item) => (
                        <li
                          key={item.key}
                          style={{
                            padding: "4px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              graduateCourse: item.value,
                              graduateCourseId: item.key,
                            }));

                            setShowCourseList(false);
                          }}
                        >
                          {item.value}
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.graduateCourse && (
                    <span className="error-text">
                      {errors.graduateCourse}
                    </span>
                  )}
                </div>

 
                <div style={{ position: "relative" }} className="form-group col-md-6">
                  <label>Specialization</label>
                  <input
                    placeholder="Start typing to search specializations..."
                    type="text"
                    value={formData.graduateSpecialization || ""}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        graduateSpecialization: e.target.value,
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
                              graduateSpecialization: item.value,
                              graduateSpecializationId: item.key,
                            }));

                            setShowSpecializationList(false);
                          }}
                        >
                          {item.value}
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.graduateSpecialization && (
                    <span className="error-text">
                      {errors.graduateSpecialization}
                    </span>
                  )}
                </div>

 
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

                    {Array.from({ length: 50 }, (_, i) => {
                      const year = (currentYear - 49) + i;
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

                    {Array.from({ length: 55 }, (_, i) => {
                      const year = (currentYear - 49) + i;
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
                    <option value="Scale 10 Grading System">Scale 10 Grading System</option>
                    <option value="Scale 4 Grading System">Scale 4 Grading System</option>
                    <option value="% Marks of 100 Maximum">% Marks of 100 Maximum</option>

                  </select>
                  {errors.graduateGradingSystem && (
                    <span className="error-text">
                      {errors.graduateGradingSystem}
                    </span>
                  )}
                </div>
 
                <div className="form-group col-md-6">
                  <label>Scale/Percentage </label>

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
            )} */}


        </div>
      </div>
    </form >
  );
};

export default FormInfoBox;
