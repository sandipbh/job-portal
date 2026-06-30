'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { statesData } from '../../../../../data/states';
import { toast } from "react-toastify";

const Verification = ({ activeTab, setActiveTab }) => {

    const imageUrl = process.env.NEXT_PUBLIC_IMAGE_URL;

    const [loading, setLoading] = useState(false);

    const [kycData, setKycData] = useState({
        companyName: "", contactPerson: "", email: "", phone: "", address: "", state: "", city: "", pincode: "",
        countryCode: "+91", country: "India", website: "", companyType: "", companySize: "",
        docType: "", docNumber: "", industry: "", industryId: "",
        aboutCompany: "",
        //documents attachment 
        logo: null, aadhaarFront: null, aadhaarBack: null, gstFile: null, udyam: null, compPhoto: null,
        //documents end 

    });

    const [states, setStates] = useState([]);
    const [selectedState, setSelectedState] = useState("");
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState("");

    const [industryList, setIndustryList] = useState([]);
    const [showIndustryList, setShowIndustryList] = useState(false);

    const [isValidUrl, setIsValidUrl] = useState(true);

    const [errors, setErrors] = useState({});

    const [kycStatus, setKycStatus] = useState("pending");
    const [aboutComp, setAboutComp] = useState("");

    const getProfileDetails = async () => {
        try {
            const response = await fetch("/api/emp-profile-details", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    term: "",
                }),
            });

            const result = await response.json();

            //console.log("Profile Details fetched:", result);

            const profile = result?.data;

            if (profile) {

                setKycData((prev) => ({
                    ...prev,

                    companyName: profile?.companyName || "",
                    contactPerson: profile?.contactPerson || "",
                    email: profile?.email || "",
                    phone: profile?.phone || "",
                    address: profile?.address || "",
                    state: profile?.state || "",
                    city: profile?.city || "",
                    pincode: profile?.pincode || "",

                    countryCode: profile?.countryCode || "",
                    country: profile?.country || "",

                    website: profile?.website || "",
                    companyType: profile?.companyType || "",
                    companySize: profile?.companySize || "",
                    logo: imageUrl + "" + profile?.logo || "",
                    docType: profile?.docType || "",
                    docNumber: profile?.docNumber || "",
                    industry: profile?.industry || "",
                    industryId: profile?.industryId || "",
                    aboutCompany: profile?.aboutCompany || "",

                    aadhaarFront: imageUrl + "" + profile?.aadhaarFront || "",
                    aadhaarBack: imageUrl + "" + profile?.aadhaarBack || "",
                    gstFile: imageUrl + "" + profile?.gstFile || "",
                    udyam: imageUrl + "" + profile?.udyam || "",

                    compPhoto: imageUrl + "" + profile?.compPhoto || "",

                }));

                setKycStatus(profile?.kycStatus);
            }
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        getProfileDetails();
    }, [0])
    useEffect(() => {


        handleStateChange(kycData.state);
        setSelectedCity(kycData.city);

    }, [kycData.state]);


    const validateStep1 = () => {
        let newErrors = {};
        //////return true ;
        if (!kycData.companyName || kycData.companyName.length < 5 || kycData.companyName.trim() == "") {
            newErrors.companyName = "Company name is required";
        }

        if (!kycData.contactPerson || kycData.contactPerson.length < 3 || kycData.contactPerson.trim() == "") {
            newErrors.contactPerson = "Contact person name is required";
        }

        if (!kycData.email || kycData.email.length < 3 || kycData.email.trim() == "") {
            newErrors.email = "Email is required";
        } else if (!/^\S+@\S+\.\S+$/.test(kycData.email)) {
            newErrors.email = "Invalid email";
        }

        if (!kycData.phone || kycData.phone.length !== 10) {
            newErrors.phone = "Enter valid 10-digit number";
        }
        if (!kycData.address || kycData.address.length < 10 || kycData.address.trim() == "") {
            newErrors.address = "Enter valid address";
        }
        if (!kycData.state || kycData.state.trim() == "") {
            newErrors.state = "Select valid state";
        }
        if (!kycData.city || kycData.city.length < 3 || kycData.city.trim() == "") {
            newErrors.city = "Select valid city";
        }

        if (!kycData.pincode || kycData.pincode.length != 6 || kycData.pincode.trim() == "") {
            newErrors.pincode = "Enter 6 digit valid pin code";
        }

        if (!kycData.website || kycData.website.trim() === "") {
            newErrors.website = "Enter website URL";
        } else {
            try {
                new URL(kycData.website);
            } catch {
                newErrors.website = "Enter a valid website URL (https://example.com)";
            }
        }
        if (!kycData.companyType || kycData.companyType.length < 3 || kycData.companyType.trim() == "") {
            newErrors.companyType = "Select company type";
        }

        if (!kycData.companySize || kycData.companySize == "0" || kycData.companySize.trim() == "") {
            newErrors.companySize = "Enter company team size";
        }
        if (!kycData.industry || kycData.industry.trim() == "" || kycData.industry.length < 3) {
            newErrors.industry = "Search your industry";
        }

        if (!kycData.industryId || kycData.industryId == "0") {
            newErrors.industryId = "Search your industry";
        }
        if (!kycData.aboutCompany || kycData.aboutCompany.length < 10) {
            newErrors.aboutCompany = "Enter about your company";
        }

        if (!kycData.logo || kycData.logo.length < 5) {
            newErrors.logo = "Select company logo";
        }



        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        let newErrors = {};
        //////return true ; 
        if (!kycData.docType) {
            newErrors.docType = "Please select document type";
        }

        if (!kycData.docNumber) {
            newErrors.docNumber = "Document number is required";
        } else {
            const cleanValue = kycData.docNumber.replace(/\s/g, "");

            // Aadhaar
            if (
                kycData.docType === "aadhaar" &&
                !/^\d{12}$/.test(cleanValue)
            ) {
                newErrors.docNumber = "Aadhaar must be 12 digits";
            }

            // PAN
            if (
                kycData.docType === "pan" &&
                !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanValue)
            ) {
                newErrors.docNumber = "Invalid PAN format (ABCDE1234F)";
            }

            // GST
            if (
                kycData.docType === "gst" &&
                !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9][A-Z][A-Z0-9]$/.test(cleanValue)
            ) {
                newErrors.docNumber = "Invalid GSTIN (e.g., 22ABCDE1234F1Z5)";
            }

            // Driving License (NEW)
            if (kycData.docType === "dl") {
                const dlRegex = /^[A-Z]{2}[0-9]{2,14}$/;

                if (!dlRegex.test(cleanValue)) {
                    newErrors.docNumber =
                        "Invalid Driving License (e.g., MH1220110012345)";
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        let newErrors = {};

        if (kycData.docType === "aadhaar") {
            if (!kycData.aadhaarFront) newErrors.aadhaarFront = "Upload Aadhaar front";
            if (!kycData.aadhaarBack) newErrors.aadhaarBack = "Upload Aadhaar back";
        }

        if (kycData.docType === "gst") {
            if (!kycData.gstFile) newErrors.gstFile = "Upload GST certificate";
        }

        if (kycData.docType === "dl") {
            if (!kycData.udyam) newErrors.udyam = "Upload DL front";
            if (!kycData.dlBack) newErrors.dlBack = "Upload DL back";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const [uploadProgress, setUploadProgress] = useState({});


    const convertToBase64 = (file, fieldName) => {
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            setKycData((prev) => ({
                ...prev,
                [fieldName]: reader.result,
            }));
        };

        reader.readAsDataURL(file);
    };

    const renderFile = (base64) => {
        if (!base64) return null;

        if (base64?.startsWith("data:image")) {
            return (
                <img
                    src={base64}
                    alt="Preview"
                    style={{ maxWidth: "100%" }}
                />
            );
        }

        if (base64?.startsWith("data:application/pdf")) {
            return (
                <iframe

                    src={`${base64}#toolbar=0&navpanes=0&scrollbar=0`}
                    width="100%"
                    height="500"
                    title="PDF Preview"
                />
            );
        }

        return <p>Preview not available</p>;
    };


    const [previewFile, setPreviewFile] = useState(null);
    const openPreview = (file) => {
        setPreviewFile(file);
    };

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

        setKycData((prev) => ({
            ...prev,
            state: state,
        }));


        if (state && statesData[state]) {
            setCities([...statesData[state]].sort());
        } else {
            setCities([]);
        }
    };

    const getIndustry = async (term) => {
        if (!term || term.length < 2) {
            setIndustryList([]);
            return;
        }
        //console.log("Fetching Industry for term:", term);
        try {

            const response = await fetch("/api/list-industry-search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    term: term,
                }),
            });

            const data = await response.json();
            //console.log("Industry fetched:", JSON.stringify(data));

            setIndustryList(data && data.data ? data.data : []);
            setShowIndustryList(true);


        } catch (error) {
            console.error(error);
        }
    };



    const handleSubmit = async () => {

        console.log("FINAL FORM DATA:", kycData);

        let newErrors = {};

        if (!kycData.compPhoto || kycData.compPhoto.length < 5) {
            newErrors.compPhoto = "Select company photos";
        }
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return false;
        }
        else {

            try {
                setLoading(true);
                const res = await fetch("/api/emp-update-profile-kyc", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...kycData,
                    }),
                });

                const user = await res.json();
                console.log("Response from /api/emp-update-profile-kyc:", user);

                if (!res.ok) {
                    toast.error(user.message || "Profile update failed");
                    setLoading(false);
                    return;
                }


                setKycStatus("pending");
                setActiveTab(4);

                // // simulate API
                // setTimeout(() => {
                //     setKycStatus("verified"); // or "rejected"
                // }, 2000);

                //setActiveTab(4);

                toast.success(user.message);
            } catch (error) {
                console.error(error);
                toast.error("Profile update failed. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };
    const validateInput = (value) => {
        const regex = /^[a-zA-Z0-9\s.,!?()&'":;-]*$/;
        return regex.test(value);
    };
    const handleAboutCompany = (e) => {
        const value = e.target.value;

        if (/<[^>]*>/.test(value)) {
            toast.error("HTML tags are not allowed")
            return;
        }
        if (validateInput(value)) {

            setKycData((prev) => ({
                ...prev,
                aboutCompany: value,
            }));
            setAboutComp(value)

        }
    };
    return (
        <>
            {/* 🔥 TABS START */}
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
                    "Basic Details",
                    "Document Details",
                    "Upload Documents",
                    "Photo & Review",
                    "Confirmation",
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
                {activeTab === 0 && (
                    <div className="row">

                        {/* company Name */}
                        <div className="form-group col-lg-6">
                            <label>Company Name (as per official Document)</label>
                            <input
                                type="text"
                                readOnly
                                value={kycData.companyName}
                                onChange={(e) =>
                                    setKycData({
                                        ...kycData,
                                        companyName: e.target.value,
                                    })
                                }
                                placeholder="Enter company name"
                            />

                            {errors.companyName && (
                                <span className="error-text">{errors.companyName}</span>
                            )}


                        </div>

                        {/* Contact Person */}
                        <div className="form-group col-lg-6">
                            <label>Contact Person </label>
                            <input
                                type="text"
                                readOnly
                                value={kycData.contactPerson || ""}
                                onChange={(e) => {
                                    setKycData({ ...kycData, contactPerson: e.target.value.replace(/[^a-zA-Z\s]/g, "") });
                                }}
                                placeholder="Enter contact Person"
                            />

                            {errors.contactPerson && (
                                <span className="error-text">{errors.contactPerson}</span>
                            )}
                        </div>

                        {/* Email */}
                        <div className="form-group col-lg-6">
                            <label>Email Address</label>
                            <input
                                type="email"
                                readOnly
                                value={kycData.email || ""}
                                onChange={(e) =>
                                    setKycData({ ...kycData, email: e.target.value })
                                }
                                placeholder="Enter company email"
                            />

                            {errors.email && (
                                <span className="text-danger small">{errors.email}</span>
                            )}
                        </div>

                        {/* Mobile Number */}
                        <div className="form-group col-lg-6">
                            <label>Phone Number</label>

                            <div className={`phone-input ${errors.phone ? "error" : ""}`}>
                                <span className="country-code">+91</span>
                                <input
                                    type="tel"
                                    readOnly
                                    style={{ border: "0px" }}
                                    value={kycData.phone || ""}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "");
                                        setKycData({ ...kycData, phone: value });
                                    }}
                                    maxLength={10}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            {errors.phone && (
                                <span className="text-danger small">{errors.phone}</span>
                            )}
                        </div>



                        <div className="form-group col-lg-6">
                            <label>State   </label>
                            <select
                                className="form-select "
                                value={selectedState}

                                onChange={(e) => {
                                    const value = e.target.value;

                                    setKycData((prev) => ({
                                        ...prev,
                                        state: value,
                                        city: "",
                                    }));

                                    setKycData((prev) => ({
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

                                    setKycData((prev) => ({
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

                        {/* Address */}
                        <div className="form-group col-lg-6">
                            <label>Address</label>
                            <input
                                type="text"
                                className="form-control"
                                value={kycData.address || ""}
                                onChange={(e) =>
                                    setKycData({ ...kycData, address: e.target.value })
                                }
                                placeholder="Enter full address"
                            />
                            {errors.address && (
                                <span className="text-danger small">{errors.address}</span>
                            )}
                        </div>
                        <div className="form-group col-lg-6 col-md-12">
                            <label>Pin Code</label>
                            <input

                                type="tel"
                                value={kycData.pincode || ""}
                                maxLength={6}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    setKycData({ ...kycData, pincode: value });
                                }}

                                placeholder="Enter Pin Code"
                            />
                            {errors.pincode && (
                                <span className="error-text">{errors.pincode}</span>
                            )}
                        </div>

                        {/* Address */}
                        <div className="form-group col-lg-6">
                            <label>Website</label>

                            <input
                                type="text"
                                value={kycData.website || ""}
                                placeholder="Website URL"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setKycData({
                                        ...kycData,
                                        website: value,
                                    });

                                    const urlPattern =
                                        /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i;
                                    setIsValidUrl(value === "" || urlPattern.test(value));
                                }}
                            />


                            {errors.website && (
                                <span className="error-text">
                                    {errors.website}
                                </span>
                            )}
                        </div>

                        {/* Company Type */}
                        <div className="form-group col-lg-6">
                            <label>Company Type</label>
                            <select
                                className={`form-select ${errors.companyType ? "is-invalid" : ""}`}
                                value={kycData.companyType}
                                onChange={(e) =>
                                    setKycData({
                                        ...kycData,
                                        companyType: e.target.value
                                    })
                                }
                            >
                                <option value="">Select Company Type</option>
                                <option value="Company/Partnership">Company/Partnership</option>
                                <option value="Proprietorship">Proprietorship</option>
                                <option value="Individual">Individual</option>
                                <option value="Other">Other</option>

                            </select>
                            {errors.companyType && (
                                <span className="error-text">
                                    {errors.companyType}
                                </span>
                            )}


                        </div>

                        <div style={{ position: "relative" }} className="form-group col-md-6">
                            <label>Industry   </label>
                            <input
                                placeholder="Search your industry"
                                type="text"
                                value={kycData.industry || ""}
                                onChange={(e) => {
                                    setKycData((prev) => ({
                                        ...prev,
                                        industry: e.target.value,
                                    }));

                                    getIndustry(e.target.value);
                                    setShowIndustryList(true);
                                }}
                            />

                            {showIndustryList && industryList.length > 0 && (
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
                                    {industryList.map((item) => (
                                        <li
                                            key={item.key}
                                            style={{
                                                padding: "4px",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => {
                                                setKycData((prev) => ({
                                                    ...prev,
                                                    industry: item.value,
                                                    industryId: item.key,
                                                }));

                                                setShowIndustryList(false);
                                            }}
                                        >
                                            {item.value}
                                        </li>
                                    ))}
                                </ul>
                            )}


                            {errors.industry && (
                                <span className="error-text">
                                    {errors.industry}
                                </span>
                            )}
                        </div>
                        <div className="form-group col-lg-6 col-md-12">
                            <label>Company Size</label>
                            <input
                                type="tel"
                                value={kycData.companySize || ""}
                                maxLength={4}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    setKycData({ ...kycData, companySize: value });
                                }}

                                placeholder="Enter Team Size"
                            />
                            {errors.companySize && (
                                <span className="error-text">{errors.companySize}</span>
                            )}
                        </div>
                        {/* 🔹 LEFT PANEL → LOGO */}
                        <div className="form-group col-lg-6 col-md-12">
                            <>
                                {/* Preview */}
                                {kycData.logo && (
                                    <div className="text-center mt-3  mb-3">
                                        <img
                                            src={kycData.logo}
                                            className="img-fluid rounded border"
                                            style={{ maxHeight: "100px", objectFit: "cover" }}
                                        />
                                    </div>
                                )}

                                <label>Company Logo</label>
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg, .png, .jpg, .jpeg"
                                    className="form-control"
                                    onChange={(e) => {
                                        setKycData({
                                            ...kycData,
                                            logo: e.target.files[0],
                                        });
                                        setErrors((prev) => ({ ...prev, logo: "" }));

                                        convertToBase64(e.target.files[0], "logo")
                                    }}
                                />

                                {/* Error */}
                                {errors.logo && (
                                    <span className="text-danger small mt-2">{errors.logo}</span>
                                )}
                            </>
                        </div>
                        {/* About Company */}
                        <div className="form-group col-lg-6">
                            <label>
                                About Company
                                <span style={{ fontSize: "12px", color: "#999" }}>
                                    (Optional)
                                </span>
                            </label>

                            <textarea

                                className=" about-input-company"
                                maxLength={250}
                                value={kycData.aboutCompany}
                                onChange={handleAboutCompany}
                                placeholder="Write about your company, culture, values..."
                            />

                            <div className="d-flex justify-content-between">
                                <div>
                                    {errors.aboutCompany && (
                                        <span className="text-danger small mt-2">{errors.aboutCompany}</span>
                                    )}</div>
                                <div
                                    className="text-end text-red mt-1"
                                    style={{ fontSize: "12px" }}
                                >
                                    {aboutComp.length} / 250
                                </div>
                            </div></div>


                        {/* Navigation Buttons */}
                        <div className="form-group col-lg-12 mt-3">
                            <div className="d-flex justify-content-end">
                                <button
                                    type="button"
                                    className="theme-btn btn-style-one"
                                    onClick={() => {
                                        if (validateStep1()) {
                                            setActiveTab(1);
                                        }
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </form >


            <form className="default-form">
                {activeTab === 1 && (
                    <div className="row">

                        {/* Document Type */}
                        <div className="form-group col-lg-6">
                            <label>Document Type</label>
                            <select
                                className={`form-select ${errors.docType ? "is-invalid" : ""}`}
                                value={kycData.docType}
                                onChange={(e) =>
                                    setKycData({
                                        ...kycData,
                                        docType: e.target.value,
                                        docNumber: "", // reset when changed
                                    })
                                }
                            >
                                <option value="">Select Document</option>
                                {/* <option value="aadhaar">Aadhaar Card</option> */}
                                <option value="gst">GST Certificate</option>
                                <option value="ud">Udyam Aadhaar</option>
                            </select>

                            <span className="text-danger small"> {errors.docType && (errors.docType)}</span>
                        </div>

                        {/* Document Number */}
                        <div className="form-group col-lg-6">
                            <label>Document Number</label>

                            <input
                                type="text"
                                className={`form-control ${errors.docNumber ? "is-invalid" : ""}`}
                                value={kycData.docNumber}
                                onChange={(e) => {
                                    let value = e.target.value;

                                    // Aadhaar
                                    if (kycData.docType === "aadhaar") {
                                        value = value.replace(/\D/g, "").slice(0, 12);

                                        // optional formatting (nice UX)
                                        value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
                                    }


                                    // GST → uppercase alphanumeric (max 15)
                                    if (kycData.docType === "gst") {
                                        value = value
                                            .toUpperCase()
                                            .replace(/[^A-Z0-9]/g, "")
                                            .slice(0, 15);
                                    }

                                    // Driving License → uppercase alphanumeric (max 15–16)
                                    if (kycData.docType === "ud") {
                                        value = value
                                            .toUpperCase()
                                            .replace(/^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/g, "")
                                            .slice(0, 16);

                                        // optional formatting: UDYAM-DL-20-0000000
                                        value = value.replace(
                                            /^([A-Z]{2})(\d{2})(\d{4})(\d+)/,
                                            "$1$2 $3 $4"
                                        );
                                    }

                                    setKycData({ ...kycData, docNumber: value });
                                }}
                                placeholder={
                                    kycData.docType === "aadhaar"
                                        ? "Enter 12-digit Aadhaar"
                                        : kycData.docType === "gst"
                                            ? "Enter GSTIN (22ABCDE1234F1ZF)"
                                            : kycData.docType === "ud"
                                                ? "Enter Udyam Registraton (UDYAM-DL-20-0000000)"
                                                : "Enter document number"
                                }
                            />


                            {/* 

                            {!errors.docNumber && kycData.docType === "gst" && (
                                <small className="text-muted">
                                    GSTIN must be 15 characters (e.g., 22ABCDE1234F1ZF)
                                </small>
                            )}

                            {!errors.docNumber && kycData.docType === "ud" && (
                                <small className="text-muted">
                                    Format: UDYAM-DL-20-0000000
                                </small>
                            )} */}


                            <span className="text-danger small"> {errors.docNumber && (errors.docNumber)}</span>

                        </div>

                        {/* Navigation */}
                        <div className="form-group col-lg-12 mt-3">
                            <div className="d-flex justify-content-between">

                                <button
                                    type="button"
                                    className="theme-btn btn-style-one"
                                    onClick={() => setActiveTab(0)}
                                >
                                    Back
                                </button>

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

                            </div>
                        </div>

                    </div>

                )}
            </form>

            <form className="default-form">
                {activeTab === 2 && (
                    <div className="row">

                        {/* Aadhaar Upload */}
                        {kycData.docType === "aadhaar" && (
                            <>
                                {kycData.aadhaarFront && (
                                    <div className="image-container">
                                        <img
                                            src={kycData.aadhaarFront}
                                            className="preview-img"
                                        />
                                    </div>
                                )}
                                <div className="form-group col-lg-6">
                                    <label>Aadhaar Front</label>

                                    <input
                                        type="file"
                                        className={`form-control ${errors.aadhaarFront ? "is-invalid" : ""}`}
                                        onChange={(e) => {
                                            setKycData({
                                                ...kycData,
                                                aadhaarFront: e.target.files[0],
                                            });
                                            setErrors((prev) => ({ ...prev, aadhaarFront: "" }));

                                            convertToBase64(e.target.files[0], "aadhaarFront")


                                            let progress = 0;
                                            const interval = setInterval(() => {
                                                progress += 10;

                                                setUploadProgress((prev) => ({
                                                    ...prev,
                                                    aadhaarFront: progress,
                                                }));

                                                if (progress >= 100) clearInterval(interval);
                                            }, 100);
                                        }}
                                    />

                                    {/* Progress Bar */}
                                    {uploadProgress?.aadhaarFront > 0 && (
                                        <div className="progress mt-2">
                                            <div
                                                className="progress-bar"
                                                style={{ width: `${uploadProgress.aadhaarFront}%` }}
                                            >
                                                {uploadProgress.aadhaarFront}%
                                            </div>
                                        </div>
                                    )}

                                    {errors.aadhaarFront && (
                                        <p className="text-danger small">{errors.aadhaarFront}</p>
                                    )}


                                </div>

                                {kycData.aadhaarBack && (
                                    <div className="image-container">
                                        <img
                                            src={kycData.aadhaarBack}
                                            className="preview-img"
                                        /></div>
                                )}

                                <div className="form-group col-lg-6">
                                    <label>Aadhaar Back</label>

                                    <input
                                        type="file"
                                        className={`form-control ${errors.aadhaarBack ? "is-invalid" : ""}`}
                                        onChange={(e) => {
                                            setKycData({
                                                ...kycData,
                                                aadhaarBack: e.target.files[0],
                                            });
                                            setErrors((prev) => ({ ...prev, aadhaarBack: "" }));

                                            convertToBase64(e.target.files[0], "aadhaarBack")

                                            let progress = 0;
                                            const interval = setInterval(() => {
                                                progress += 10;
                                                setUploadProgress((prev) => ({
                                                    ...prev,
                                                    aadhaarBack: progress,
                                                }));
                                                if (progress >= 100) clearInterval(interval);
                                            }, 100);
                                        }}
                                    />

                                    {/* ✅ Progress */}
                                    {uploadProgress?.aadhaarBack > 0 && (
                                        <div className="progress mt-2">
                                            <div
                                                className="progress-bar"
                                                style={{ width: `${uploadProgress.aadhaarBack}%` }}
                                            >
                                                {uploadProgress.aadhaarBack}%
                                            </div>
                                        </div>
                                    )}


                                    {/* Error */}
                                    {errors.aadhaarBack && (
                                        <p className="text-danger small">{errors.aadhaarBack}</p>
                                    )}
                                </div>
                            </>
                        )}


                        {/* GST Upload */}
                        {kycData.docType === "gst" && (

                            <div className="form-group col-lg-6">
                                {/* ✅ Preview */}

                                {kycData.gstFile &&
                                    typeof kycData.gstFile === "string" &&
                                    kycData.gstFile.startsWith("data:application/pdf") ? (
                                    <iframe
                                        src={`${kycData.gstFile}#toolbar=0&navpanes=0&scrollbar=0`}
                                        width="100%"
                                        height="200"
                                        title="PDF Preview"
                                    />
                                ) : (
                                    kycData.gstFile?.length > 10 && (
                                        <iframe
                                            src={`${kycData.gstFile}#toolbar=0&navpanes=0&scrollbar=0`}
                                            width="100%"
                                            height="200"
                                            title="PDF Preview"
                                        />
                                    )
                                )}
                                <br />
                                <label>GST Certificate   </label>

                                <input
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    className={`form-control ${errors.gstFile ? "is-invalid" : ""}`}
                                    onChange={(e) => {
                                        setKycData({
                                            ...kycData,
                                            gstFile: e.target.files[0],
                                        });
                                        setErrors((prev) => ({ ...prev, gstFile: "" }));

                                        convertToBase64(e.target.files[0], "gstFile")

                                        let progress = 0;
                                        const interval = setInterval(() => {
                                            progress += 10;
                                            setUploadProgress((prev) => ({
                                                ...prev,
                                                gstFile: progress,
                                            }));
                                            if (progress >= 100) clearInterval(interval);
                                        }, 100);
                                    }}
                                />

                                {/* Progress */}
                                {uploadProgress?.gstFile > 0 && (
                                    <div className="progress mt-2">
                                        <div
                                            className="progress-bar"
                                            style={{ width: `${uploadProgress.gstFile}%` }}
                                        >
                                            {uploadProgress.gstFile}%
                                        </div>
                                    </div>
                                )}



                                {/* ✅ Error */}
                                {errors.gstFile && (
                                    <p className="text-danger small">{errors.gstFile}</p>
                                )}
                            </div>
                        )}

                        {/* Driving License Upload */}
                        {kycData.docType === "ud" && (
                            <>
                                {/* Udyam */}


                                {kycData.udyam &&
                                    typeof kycData.udyam === "string" &&
                                    kycData.udyam.startsWith("data:application/pdf") ? (
                                    <iframe

                                        src={`${kycData.udyam}#toolbar=0&navpanes=0&scrollbar=0`}
                                        width="100%"
                                        height="200"
                                        title="PDF Preview"
                                    />
                                ) : (
                                    <iframe
                                        src={`${kycData.udyam}#toolbar=0&navpanes=0&scrollbar=0`}
                                        width="100%"
                                        height="200"
                                        title="PDF Preview"
                                    />
                                )}


                                <div className="form-group col-lg-6">
                                    <label>Udyam Aadhar</label>
                                    <input
                                        type="file"
                                        className={`form-control ${errors.udyam ? "is-invalid" : ""}`}
                                        onChange={(e) => {
                                            setKycData({
                                                ...kycData,
                                                udyam: e.target.files[0],
                                            });
                                            setErrors((prev) => ({ ...prev, udyam: "" }));

                                            convertToBase64(e.target.files[0], "udyam")

                                            let progress = 0;
                                            const interval = setInterval(() => {
                                                progress += 10;
                                                setUploadProgress((prev) => ({
                                                    ...prev,
                                                    udyam: progress,
                                                }));
                                                if (progress >= 100) clearInterval(interval);
                                            }, 100);
                                        }}
                                    />

                                    {/* Progress */}
                                    {uploadProgress?.udyam > 0 && (
                                        <div className="progress mt-2">
                                            <div
                                                className="progress-bar"
                                                style={{ width: `${uploadProgress.udyam}%` }}
                                            >
                                                {uploadProgress.udyam}%
                                            </div>
                                        </div>
                                    )}


                                    {/* Error */}
                                    {errors.udyam && (
                                        <p className="text-danger small">{errors.udyam}</p>
                                    )}
                                </div>


                            </>
                        )}

                        {/* Navigation */}
                        <div className="form-group col-lg-12 mt-3">
                            <div className="d-flex justify-content-between">

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
                                    onClick={() => {
                                        if (validateStep3()) {
                                            setActiveTab(3);
                                        }
                                    }}
                                >
                                    Next
                                </button>

                            </div>
                        </div>

                    </div>
                )}
            </form>

            <form className="default-form">
                {activeTab === 3 && (
                    <div className="row align-items-start" >

                        {/* 🔹 LEFT PANEL → SELFIE */}
                        <div className="col-lg-3">
                            <div className="review-card h-100 p-3 shadow-sm rounded">
                                {/* Preview */}
                                {kycData.compPhoto && (
                                    <div className="text-center mt-3  mb-3">
                                        <img
                                            src={kycData.compPhoto}
                                            className="img-fluid rounded border"
                                            style={{ maxHeight: "200px", objectFit: "cover" }}
                                        />
                                    </div>
                                )}
                                <h6 className="mb-3 border-bottom pb-2">
                                    Company Photos
                                </h6>


                                <input
                                    type="file"
                                    accept="image/png, image/jpeg, .png, .jpg, .jpeg"
                                    className="form-control"
                                    onChange={(e) => {
                                        setKycData({
                                            ...kycData,
                                            compPhoto: e.target.files[0],
                                        });
                                        setErrors((prev) => ({ ...prev, compPhoto: "" }));

                                        convertToBase64(e.target.files[0], "compPhoto")
                                    }}
                                />

                                {/* Error */}
                                {errors.compPhoto && (
                                    <span className="text-danger small mt-2">{errors.compPhoto}</span>
                                )}
                            </div>
                        </div>

                        {/* 🔹 RIGHT PANEL → REVIEW */}
                        <div className="col-lg-9">

                            <h4 className="mb-3 fw-bold">
                                Review Your Details
                            </h4>

                            {/* 🔸 BASIC DETAILS */}
                            <div className="review-card mb-3 p-3 shadow-sm rounded">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="fw-semibold mb-0">Basic Details</h6>
                                    <button className="btn btn-sm btn-primary" onClick={() => setActiveTab(0)}>
                                        Edit
                                    </button>
                                </div>

                                <div className="row">
                                    <div className="col-md-4">
                                        <small className="text-muted">Company Name</small>
                                        <p className="mb-1 fw-medium">{kycData.companyName}</p>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted">Contact Person</small>
                                        <p className="mb-1 fw-medium">{kycData.contactPerson}</p>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted">Email</small>
                                        <p className="mb-1 fw-medium">{kycData.email}</p>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted">Phone</small>
                                        <p className="mb-1 fw-medium">{kycData.phone}</p>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted">Address</small>
                                        <p className="mb-1 fw-medium">{kycData.address}</p>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted">State</small>
                                        <p className="mb-1 fw-medium">{kycData.state}</p>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted">City</small>
                                        <p className="mb-1 fw-medium">{kycData.city}</p>
                                    </div>

                                    <div className="col-md-4">
                                        <small className="text-muted">Pin Code</small>
                                        <p className="mb-1 fw-medium">{kycData.pincode}</p>
                                    </div>

                                    <div className="col-md-4">
                                        <small className="text-muted">Website</small>
                                        <p className="mb-1 fw-medium">{kycData.website}</p>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted">Company Type</small>
                                        <p className="mb-1 fw-medium">{kycData.companyType}</p>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted">Company Size</small>
                                        <p className="mb-1 fw-medium">{kycData.companySize}</p>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted">Industry</small>
                                        <p className="mb-1 fw-medium">{kycData.industry}</p>
                                    </div>
                                    <div className="col-md-12">
                                        <small className="text-muted">About Company</small>
                                        <p className="mb-1 fw-medium">{kycData.aboutCompany}</p>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted">Logo</small>
                                        {kycData.logo && (
                                            <div className="col-md-12">
                                                <div className="doc-card" onClick={() => openPreview(kycData.logo)}>
                                                    <img src={kycData.logo} width={100} height={100} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>

                            {/* 🔸 DOCUMENT DETAILS */}
                            <div className="review-card mb-3 p-3 shadow-sm rounded">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="fw-semibold mb-0">Document Details</h6>
                                    <button className="btn btn-sm btn-primary" onClick={() => setActiveTab(1)}>
                                        Edit
                                    </button>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <small className="text-muted">Type</small>
                                        <p className="mb-1 fw-medium text-uppercase">
                                            {kycData.docType || "-"}
                                        </p>
                                    </div>
                                    <div className="col-md-6">
                                        <small className="text-muted">Number</small>
                                        <p className="mb-1 fw-medium">{kycData.docNumber || "-"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 🔸 DOCUMENT PREVIEW */}
                            <div className="review-card p-3 shadow-sm rounded">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-semibold mb-0">Uploaded Documents</h6>
                                    <button className="btn btn-sm btn-primary" onClick={() => setActiveTab(2)}>
                                        Edit
                                    </button>
                                </div>

                                <div className="row g-3">

                                    {/* Aadhaar */}
                                    {kycData.docType === "aadhaar" && (
                                        <>

                                            {kycData.aadhaarFront && (
                                                <div className="col-md-6">
                                                    <div className="doc-card" onClick={() => openPreview(kycData.aadhaarFront)}>
                                                        <span className="badge ">Uploaded</span>
                                                        <p className="mt-2 mb-1 small text-muted">Aadhaar Front</p>
                                                        <img src={kycData.aadhaarFront} />
                                                    </div>
                                                </div>
                                            )}

                                            {kycData.aadhaarBack && (
                                                <div className="col-md-6">
                                                    <div className="doc-card" onClick={() => openPreview(kycData.aadhaarBack)}>
                                                        <span className="badge  ">Uploaded</span>
                                                        <p className="mt-2 mb-1 small text-muted">Aadhaar Back</p>
                                                        <img src={kycData.aadhaarBack} />
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}



                                    {/* GST */}
                                    {kycData.docType === "gst" && kycData.gstFile && (
                                        <div className="col-md-6">
                                            <div className="doc-card" onClick={() => openPreview(kycData.gstFile)}>
                                                <span className="badge ">Uploaded</span>
                                                <p className="mt-2 mb-1 small text-muted">GST Certificate</p>


                                                {kycData.gstFile && (
                                                    kycData.gstFile?.startsWith("data:application/pdf") ? (
                                                        <iframe

                                                            src={`${kycData.gstFile}#toolbar=0&navpanes=0&scrollbar=0`}
                                                            width="100%"
                                                            height="200"
                                                            title="PDF Preview"
                                                        />
                                                    ) : (
                                                        <iframe

                                                            src={`${kycData.gstFile}#toolbar=0&navpanes=0&scrollbar=0`}
                                                            width="100%"
                                                            height="200"
                                                            title="PDF Preview"
                                                        />
                                                    )
                                                )}

                                            </div>
                                        </div>
                                    )}

                                    {kycData.docType === "ud" && kycData.udyam && (
                                        <div className="col-md-6">
                                            <div className="doc-card" onClick={() => openPreview(kycData.udyam)}>
                                                <span className="badge ">Uploaded</span>
                                                <p className="mt-2 mb-1 small text-muted">Udyam Certificate</p>


                                                {kycData.udyam && (
                                                    kycData.udyam?.startsWith("data:application/pdf") ? (
                                                        <iframe

                                                            src={`${kycData.udyam}#toolbar=0&navpanes=0&scrollbar=0`}
                                                            width="100%"
                                                            height="200"
                                                            title="PDF Preview"
                                                        />
                                                    ) : (
                                                        <iframe

                                                            src={`${kycData.udyam}#toolbar=0&navpanes=0&scrollbar=0`}
                                                            width="100%"
                                                            height="200"
                                                            title="PDF Preview"
                                                        />
                                                    )
                                                )}



                                            </div>
                                        </div>
                                    )}



                                </div>
                            </div>
                        </div>

                        {/* 🔹 MODAL PREVIEW */}
                        {previewFile && (
                            <div className="preview-modal" onClick={() => setPreviewFile(null)}>
                                <div className="preview-content" onClick={(e) => e.stopPropagation()}>

                                    {typeof previewFile === "string" &&
                                        (
                                            previewFile.startsWith("data:application/pdf") ? (
                                                <iframe

                                                    src={`${previewFile}#toolbar=0&navpanes=0&scrollbar=0`}
                                                    width="100%"
                                                    height="500px"
                                                    title="PDF Preview"
                                                />
                                            ) : (
                                                <img
                                                    src={previewFile}
                                                    alt="Preview"
                                                    className="img-fluid"
                                                />
                                            )
                                        )}

                                    <button className="close-btn" onClick={() => setPreviewFile(null)}>✖</button>
                                </div>
                            </div>
                        )}


                        {/* 🔹 NAVIGATION */}
                        <div className="form-group col-lg-12 mt-4">
                            <div className="d-flex justify-content-between">

                                <button
                                    type="button"
                                    className="theme-btn btn-style-one"
                                    onClick={() => setActiveTab(2)}
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
                                {/* <button
                                    type="button"
                                    className="theme-btn btn-style-one"
                                    onClick={() => {
                                      
                                        handleSubmit();     // your submit logic
                                        setActiveTab(4);    // 👉 move to Confirmation tab
                                    }}
                                >
                                    Submit KYC
                                </button> */}

                            </div>
                        </div>

                    </div>
                )}
            </form>


            {activeTab === 4 && (
                <div className="row justify-content-center">

                    <div className="col-lg-8">
                        <div className="confirmation-card text-center p-4 shadow-sm rounded">

                            {/* 🔹 STATUS ICON */}
                            <div className="mb-3">
                                {kycStatus === "verified" && (
                                    <div className="status-icon success">✔</div>
                                )}
                                {kycStatus === "pending" && (
                                    <div className="status-icon pending">⏳</div>
                                )}
                                {kycStatus === "rejected" && (
                                    <div className="status-icon rejected">✖</div>
                                )}
                            </div>

                            {/* 🔹 TITLE */}
                            <h3 className="mb-2">
                                {kycStatus === "verified" && "KYC Verified Successfully"}
                                {kycStatus === "pending" && "KYC Submitted Successfully"}
                                {kycStatus === "rejected" && "KYC Verification Failed"}
                            </h3>

                            {/* 🔹 DESCRIPTION */}
                            <p className="text-muted mb-4">
                                {kycStatus === "verified" &&
                                    "Your KYC has been successfully verified. You can now access all features."}

                                {kycStatus === "pending" &&
                                    "Your KYC is under review. This usually takes a few hours."}

                                {kycStatus === "rejected" &&
                                    "Your KYC was rejected. Please review your details and resubmit."}
                            </p>

                            {/* 🔹 KYC DETAILS */}
                            <div className="confirmation-details text-start mb-4">


                                <div className="detail-row">
                                    <span>Company Name</span>
                                    <strong>{kycData.companyName || "-"}</strong>
                                </div>

                                <div className="detail-row">
                                    <span>Document Type</span>
                                    <strong className="text-uppercase">{kycData.docType || "-"}</strong>
                                </div>
                                <div className="detail-row">
                                    <span>Document Number</span>
                                    <strong className="text-uppercase">{kycData.docNumber || "-"}</strong>
                                </div>
                                <div className="detail-row">
                                    <span>Status</span>
                                    <strong className={`status-text ${kycStatus}`}>
                                        {kycStatus}
                                    </strong>
                                </div>

                            </div>

                            {/* 🔹 ACTION BUTTONS */}
                            <div className="d-flex justify-content-center gap-3 flex-wrap">

                                {kycStatus === "verified" && (
                                    <button className="theme-btn btn-style-one">
                                        Go to Dashboard
                                    </button>
                                )}

                                {kycStatus === "pending" && (
                                    <>
                                        <Link href="/employers-dashboard/dashboard">
                                            <button className="theme-btn btn-style-one">
                                                Go to Dashboard
                                            </button>
                                        </Link>

                                        <button
                                            className="btn btn-outline-secondary"
                                            onClick={() => setActiveTab(3)}
                                        >
                                            View Submission
                                        </button>
                                    </>
                                )}

                                {kycStatus === "rejected" && (
                                    <>
                                        <button
                                            className="theme-btn btn-style-one"
                                            onClick={() => setActiveTab(1)}
                                        >
                                            Fix & Resubmit
                                        </button>

                                        <button
                                            className="btn btn-outline-secondary"
                                            onClick={() => setActiveTab(3)}
                                        >
                                            Review Details
                                        </button>
                                    </>
                                )}

                            </div>

                        </div>
                    </div>

                </div>
            )}

        </>
    );
};

export default Verification;
