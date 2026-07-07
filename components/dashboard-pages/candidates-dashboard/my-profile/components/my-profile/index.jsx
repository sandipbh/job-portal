'use client'
import { useState, useEffect } from "react";
import FormInfoBox from "./FormInfoBox";
import LogoUpload from "./LogoUpload";
import ResumeStep from "./ResumeStep";
import { toast } from "react-toastify";
const steps = 3;

const Index = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfileDetails();
  }, []);


  const [formData, setFormData]
    = useState({
      fullName: "",
      email: "", phone: "", dob: "", state: "", city: "", address: "", pincode: "", country: "India", countryCode: "+91",
      gender: "", languages: [], languageString: "", type: "", photo: null, courses: "", stream: "",
      collegeName: "", startYear: "", endYear: "",
      tenthBoard: "", tenthPassingYear: "", tenthMedium: "", tenthMarks: "",
      twelfthBoard: "", twelfthPassingYear: "", twelfthStream: "",
      twelfthMarks: "", graduateUniversity: "", graduateUniversityId: "", graduateCourse: "",
      graduateCourseId: "", graduateSpecialization: "", graduateSpecializationId: "", graduateCourseType: "Full Time",
      graduateStartYear: "", graduateEndYear: "", graduateGradingSystem: "", graduateScore: ""
    });

  const getProfileDetails = async () => {
    try {
      const response = await fetch("/api/candi-profile-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: "",
        }),
      });

      const result = await response.json();

      // console.log("Profile Details fetched:", result);

      const profile = result?.data;

      if (profile) {

        setFormData((prev) => ({
          ...prev,

          fullName: profile.fullName || "",
          email: profile.email || "",
          phone: profile.mobile || "",
          dob: profile.dob || "",
          state: profile.state || "",
          city: profile.city || "",
          address: profile.address || "",
          pincode: profile.pinCode || "",

          country: "India",
          countryCode: "+91",

          gender: profile.gender || "",

          languages: profile.languages
            ? profile.languages.split(",")
            : [],

          languageString: profile.languages || "",

          photo: profile.photoPath || null,
          // Education
          type: profile.education || "",



        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const progress = Math.round(((step + 1) / steps) * 100);
  const [errors, setErrors] = useState({});
  const validateStep0 = () => {
    let newErrors = {};

    if (!formData.fullName?.trim()) {
      newErrors.fullName = "Enter your full name";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
        formData.email
      )
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = "Enter your phone number";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter valid 10 digit number";
    }

    if (!formData.dob || formData.dob.trim() === "" || isNaN(Date.parse(formData.dob))) {
      newErrors.dob = "Enter valid date of birth";
    }

    if (!formData.state || !formData.state.trim() || formData.state.trim().length < 2) {
      newErrors.state = "Select valid state";
    }

    if (!formData.city || !formData.city.trim()) {
      newErrors.city = "Select valid city";
    }

    if (!formData.address?.trim() || formData.address.trim().length < 10) {
      newErrors.address = "Enter your full address";
    }
    if (!formData.pincode?.trim() || !/^[0-9]{6}$/.test(formData.pincode) || formData.pincode.length !== 6) {
      newErrors.pincode = "Enter valid pincode";
    }


    if (!formData.gender || formData.gender.trim() === "") {
      newErrors.gender = "Please select your gender";
    }

    if (!formData.languages || formData.languages.length === 0) {
      newErrors.languages = "Please select at least one language";
    }

    if (!formData.type || formData.type.trim() === "") {
      newErrors.type = "Please select your education level";
    }





    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (step === 0) {
      if (!validateStep0()) return;
    }

    if (step === 1) {

    }

    setStep((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    console.log("FINAL FORM DATA:", formData);
    const payload = new FormData();

    // loop all formData dynamically
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "photo") return; // handle separately

      // skip empty values (optional but recommended)
      if (
        value === "" ||
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return;
      }

      payload.append(key, JSON.stringify(value));
    });

    // photo file
    if (formData.photo) {
      payload.append("photo", formData.photo);
    }

    try {

      setLoading(true);


      const res = await fetch("/api/candi-update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
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
    } catch (error) {
      console.error(error);
      toast.error("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }


  };


  return (
    <div className="widget-content">

      {/* Progress */}
      <div className="card-progress-wrapper">
        <div className="card-progress-top">
          <div
            className="card-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* <div className="card-progress-text">
          <b> Profile completion: {progress}%</b>
        </div> */}
      </div>

      {/* Steps */}
      {step === 0 && (
        <FormInfoBox
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
        />
      )}

      {step === 1 && (
        <LogoUpload
          formData={formData}
          setFormData={setFormData}
          goBack={() => setStep(0)}
        />
      )}

      {step === 2 && (
        <ResumeStep
          formData={formData}
          setFormData={setFormData}
        />
      )}

      {/* Navigation */}
      <div className="form-navigation">

        {step > 0 && (
          <button
            className="btn btn-info"
            onClick={() => setStep((prev) => prev - 1)}
          >
            Back
          </button>
        )}

        {step !== 1 ? (
          <button
            className="btn continue-btn"
            onClick={handleContinue}
          >
            Save & Next
          </button>
        ) : (
          <button
            className="btn submit-btn"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        )}

      </div>
    </div>
  );
};

export default Index;