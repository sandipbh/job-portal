'use client'

import { useState, useEffect } from "react";
import { FaMale, FaFemale } from "react-icons/fa";
import { MdOutlineTransgender } from "react-icons/md";
import { statesData } from '../../../../../data/states';
import { toast } from "react-toastify";

const Basic = ({ formData,
  setFormData,
  data,
  setData,
  onNext,
}) => {


  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "email"
          ? value.replace(/\s/g, "")
          : value,
    }));

    setForm((prev) => ({
      ...prev,
      [name]: value, // store raw input
      [`${name}Value`]: parseCTC(value), // store converted LPA
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };
  const [errors, setErrors] = useState({});


  const genders = [
    { label: "Male", icon: <FaMale /> },
    { label: "Female", icon: <FaFemale /> },
    { label: "Others", icon: <MdOutlineTransgender /> },
  ];

  const [selectedGender, setSelectedGender] = useState(
    data.basic?.gender || ""
  );
  const [selectedType, setSelectedType] = useState("");


  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [summaryDesc, setSummaryDesc] = useState("");

  useEffect(() => {
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

    setForm((prev) => ({
      ...prev,
      state: state,
    }));


    if (state && statesData[state]) {
      setCities([...statesData[state]].sort());
    } else {
      setCities([]);
    }
  };

  const [form, setForm] = useState({
    fullName: data.basic?.fullName || "",
    email: data.basic?.email || "",
    phone: data.basic?.phone || "",
    dob: data.basic?.dob || "",
    state: data.basic?.state || "",
    city: data.basic?.city || "",
    address: data.basic?.address || "",
    pincode: data.basic?.pincode || "",
    gender: data.basic?.gender || "",
    currentCtc: data.basic?.currentCtc || "",
    expectedCtc: data.basic?.expectedCtc || "",
    summary: data.basic?.summary || "",
    languages: "",
    languageString: "",
    country: "India",
    countryCode: "+91",
    noticePeriod: data.basic?.noticePeriod || "",

  });

  useEffect(() => {
    getProfileDetails();
  }, []);

  const getProfileDetails = async () => {
    try {
      const response = await fetch("/api/candi-update-profile-basic", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const result = await response.json();

      // console.log("Profile Details fetched:", result);

      const profile = result?.data;

      if (profile) {

        setForm((prev) => ({
          ...prev,

          fullName: profile.fullName || "",
          email: profile.email || "",
          phone: profile.mobile || "",
          dob: profile.dob || "",
          state: profile.state || "",
          city: profile.city || "",
          address: profile.address || "",
          pincode: profile.pinCode || "",
          gender: profile.gender || "",

          currentCtc: profile.currentSalary || "",
          expectedCtc: profile.expectedSalary || "",

          country: "India",
          countryCode: "+91",
          noticePeriod: profile.noticePeriod || "",

          languages: profile.languages
            ? profile.languages.split(",")
            : [],

          languageString: profile.languages || "",
          summary: profile.profileSummary || "",

        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleStateChange(form.state);
    setSelectedCity(form.city);
    setSelectedGender(form.gender);
    setSelectedType(form.type);

    if (form.languageString) {
      setLanguageData(
        parseLanguageString(form.languageString)
      );
    }

  }, [form.state, form.languageString]);

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

  const validateForm = () => {
    let newErrors = {};

    // Full Name
    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (form.fullName.trim().length < 3) {
      newErrors.fullName = "Minimum 3 characters required";
    }

    // Email
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)
    ) {
      newErrors.email = "Enter valid email address";
    }

    // Mobile
    if (!form.phone.trim()) {
      newErrors.phone = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(form.phone)) {
      newErrors.phone = "Enter valid 10 digit mobile number";
    }

    // DOB
    if (!form.dob) {
      newErrors.dob = "Date of birth is required";
    }

    // State
    if (!form.state) {
      newErrors.state = "Please select state";
    }

    // City
    if (!form.city) {
      newErrors.city = "Please select city";
    }

    // Address
    if (!form.address.trim()) {
      newErrors.address = "Address is required";
    } else if (form.address.trim().length < 10) {
      newErrors.address = "Address should be at least 10 characters";
    }

    // Gender
    if (!form.gender) {
      newErrors.gender = "Please select gender";
    }
    // Notice Period
    if (!form.noticePeriod) {
      newErrors.noticePeriod = "Please select notice period";
    }


    // Pincode
    if (!form.pincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = "Enter a valid 6-digit pincode";
    }

    // Current CTC
    if (!form.currentCtc) {
      newErrors.currentCtc = "Current CTC is required";
    }

    // Expected CTC
    if (!form.expectedCtc) {
      newErrors.expectedCtc = "Expected CTC is required";
    }
    if (!form.summary || form.summary.length < 20) {
      newErrors.summary = "Enter your professional summary";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("FINAL FORM DATA:", form);
    const payload = new FormData();

    const isValid = validateForm();
    if (!isValid) return;
    try {

      setLoading(true);

      const res = await fetch("/api/candi-update-profile-basic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
        }),
      });

      const user = await res.json();
      console.log("Response from /api/candi-update-profile:", user);

      if (!res.ok) {
        toast.error(user.message || "Request failed");
        setLoading(false);
        return;
      }


      toast.success("Profile updated successfully");

      setData((prev) => ({
        ...prev,
        basic: form,
      }));
      onNext();

    } catch (error) {
      console.error(error);
      toast.error("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [languages, setLanguages] = useState([]);
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

    setForm((prev) => ({
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

    // setFormData((prev) => ({
    //   ...prev,
    //   languages: apiLanguages,
    // }));

    console.log(apiLanguages);
    console.log("API Language Data");
    console.log(apiLanguages);
  };


  const getLanguages = async () => {

    //console.log("Fetching languages for term:", term);
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

  const languageString = formData?.languages
    .map(
      (lang) =>
        `${lang.language}^${lang.read}^${lang.write}^${lang.speak}`
    )
    .join("#") + "#";



  const parseCTC = (value) => {
    if (!value) return 0;

    let v = value.toLowerCase().replace(/,/g, "").trim();

    // L or lpa → lakh
    if (v.includes("l")) {
      return parseFloat(v) || 0;
    }

    // k = thousand
    if (v.includes("k")) {
      return (parseFloat(v) || 0) / 100;
    }

    // plain number (assume rupees)
    const num = parseFloat(v);
    if (!isNaN(num)) {
      return num / 100000; // convert rupees → LPA
    }

    return 0;
  };


  return (
    <form className="default-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h4>Personal Details</h4>
        <p>Add your personal detail in resume</p>
      </div>
      <div className="row">

        {/* FULL NAME */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Full Name</label>
          <input
            type="text"
            readOnly
            placeholder="Enter your Full Name"
            value={form.fullName || ""}
            onChange={(e) => {
              setForm({ ...form, fullName: e.target.value.replace(/[^a-zA-Z\s]/g, "") });
            }}
            maxLength={30}
          />
          {errors.fullName && (
            <span className="error-text">{errors.fullName}</span>
          )}
        </div>

        {/* EMAIL */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Email address</label>
          <input
            readOnly
            type="email"
            name="email"
            value={form.email || ""}
            onChange={handleChange}
            maxLength={50}
            placeholder="Email"
          />
          {errors.email && (
            <span className="error-text">{errors.email}</span>
          )}
        </div>


        {/* PHONE */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Mobile Number</label>

          <div className="phone-input">
            <span className="country-code">+91</span>

            <input
              readOnly
              type="tel"
              style={{ border: "0px" }}
              value={form.phone || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setForm({ ...form, phone: value });
              }}
              maxLength={10}
              placeholder="Enter phone number"
            />


          </div>
          {errors.phone && (
            <span className="error-text">{errors.phone}</span>
          )}
        </div>

        {/* DOB */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Date of Birth</label>
          <div className="phone-input">

            <input
              type="date"
              style={{ border: "0px" }}
              value={form.dob}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, dob: value });
              }}

              placeholder="Date of Birth"
            />

          </div>

          {errors.dob && (
            <span className="error-text">{errors.dob}</span>
          )}
        </div>

        <div className="form-group col-lg-6">
          <label>State   </label>
          <select
            className="form-select "
            value={selectedState}

            onChange={(e) => {
              const value = e.target.value;

              setForm((prev) => ({
                ...prev,
                state: value,
                city: "",
              }));

              setForm((prev) => ({
                ...prev,
                state: "",
                city: "",
              }));

              handleStateChange(e);
              setSelectedCity("");


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

              setForm((prev) => ({
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


        {/* ADDRESS */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Current Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => {
              const value = e.target.value;
              setForm({ ...form, address: value });
            }}
            maxLength={150}
            placeholder="Enter your current address"
          />

          {errors.address && (
            <span className="error-text">{errors.address}</span>
          )}
        </div>

        {/* PINCODE */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Pincode</label>
          <input
            type="text"
            name="pincode"
            value={form.pincode}
            maxLength={6}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setForm({ ...form, pincode: value });
            }}
            placeholder="Enter your pincode"

          />

          {errors.pincode && (
            <span className="error-text">{errors.pincode}</span>
          )}
        </div>


        {/* CURRENT CTC */}
        <div className="form-group col-lg-6 col-md-12">
          <label>
            Current CTC <span className="required">*</span> (LPA)
          </label>

          <div className="input-with-suffix">
            <input
              type="text"
              name="currentCtc"
              value={form.currentCtc}

              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setForm({ ...form, currentCtc: value });
              }}
              maxLength={7}
              placeholder="Enter Current CTC"
            />

          </div>

          {errors.currentCtc && (
            <span className="error-text">{errors.currentCtc}</span>
          )}
        </div>

        {/* EXPECTED CTC */}
        <div className="form-group col-lg-6 col-md-12">
          <label>
            Expected CTC <span className="required">*</span> (LPA)
          </label>

          <div className="input-with-suffix">
            <input
              type="text"
              name="expectedCtc"
              value={form.expectedCtc || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setForm({ ...form, expectedCtc: value });
              }}
              maxLength={7}
              placeholder="Enter Expected CTC "
            />

          </div>

          {errors.expectedCtc && (
            <span className="error-text">{errors.expectedCtc}</span>
          )}
        </div>


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

                  setForm((prev) => ({
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
        <div className="form-group col-lg-6 col-md-12">
          <label>Notice Period   </label>
          <select
            className="form-select "
            value={form.noticePeriod || ""}

            onChange={(e) => {
              const value = e.target.value;

              setForm((prev) => ({
                ...prev,
                noticePeriod: value,
              }));

            }}
          >
            <option value="">-- Select Notice Period --</option>

            <option value="Immediate joining">Immediate joining</option>
            <option value="Less than 15days">Less than 15days</option>
            <option value="Less than 30days">Less than 30days</option>
            <option value="Less than 60days">Less than 60days</option>
            <option value="Less than 90days">Less than 90days</option>

          </select>
          {errors.noticePeriod && (
            <span className="error-text">{errors.noticePeriod}</span>
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

                    setForm((prev) => ({
                      ...prev,
                      languages: updated.map((lang) => ({
                        language_id: lang.key,
                        language: lang.value,
                        read: lang.read ? 1 : 0,
                        write: lang.write ? 1 : 0,
                        speak: lang.speak ? 1 : 0,
                      })),
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
                    onClick={() => addLanguage(lang.key, lang.value)}
                  >
                    {lang.value}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* About Company */}
        <div className="form-group col-lg-12 mt-2">
          <label>
            Professional Summary
          </label>

          <textarea
            className=" about-input-company"
            maxLength={250}
            value={form.summary || ""}
            onChange={(e) => {
              const value = e.target.value;
              setForm({ ...form, summary: value });
              setSummaryDesc(value);
            }}
            placeholder="Write about your professional summary..."
          />

          <div
            className="text-end text-red mt-1"
            style={{ fontSize: "12px" }}
          >
            {summaryDesc.length} / 250
          </div>
          {errors.summary && (
            <span className="error-text">{errors.summary}</span>
          )}
        </div>
      </div>
      <div className="form-group col-12 mt-3 text-end">
        <button type="submit" className="theme-btn btn-style-one" disabled={loading}>
          {loading ? "Saving....." : "Save & Continue"}
        </button>
      </div>
    </form>
  );
};

export default Basic;