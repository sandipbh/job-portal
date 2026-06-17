'use client';

import { useState } from "react";

const PersonalDetailsForm = ({ onNext }) => {
    const [data, setData] = useState({
        fullName: "samir kumar",
        email: "ss@mail.com",
        phone: "9876543210",
        designation: "test",
        linkedin: "",
    });

    const [errors, setErrors] = useState({});

    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState("");

    // ✅ UPDATED HANDLE CHANGE (REAL-TIME VALIDATION)
    const handleChange = (e) => {
        const { name, value } = e.target;

        setData({ ...data, [name]: value });

        let errorMsg = "";

        if (name === "fullName" && !value) {
            errorMsg = "Full name is required";
        }

        if (name === "email") {
            if (!value) errorMsg = "Email is required";
            else if (!/^\S+@\S+\.\S+$/.test(value))
                errorMsg = "Invalid email";
        }

        if (name === "designation" && !value) {
            errorMsg = "Designation is required";
        }

        setErrors({
            ...errors,
            [name]: errorMsg,
        });
    };

    const validate = () => {
        let newErrors = {};

        if (!data.fullName) newErrors.fullName = "Full name is required";

        if (!data.email) newErrors.email = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(data.email))
            newErrors.email = "Invalid email";

        if (!data.phone) newErrors.phone = "Phone is required";
        else if (!/^[0-9]{10}$/.test(data.phone))
            newErrors.phone = "Enter valid 10 digit number";

        if (!data.designation)
            newErrors.designation = "Designation is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            onNext();
        }
    };

    return (
        <form className="default-form">
            <div className="row">

                {/* Full Name */}
                <div className="form-group col-lg-6">
                    <label>Full Name *</label>
                    <input
                        type="text"
                        name="fullName"
                        value={data.fullName}
                        onChange={handleChange}
                        placeholder="Enter your name"
                    />
                    {errors.fullName && (
                        <span className="text-danger small error">{errors.fullName}</span>
                    )}
                </div>

                {/* Email */}
                <div className="form-group col-lg-6">
                    <label>Email *</label>
                    <input
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={handleChange}
                        placeholder="Enter email"
                         maxLength={30}
                    />
                    {errors.email && (
                        <span className="text-danger small error">{errors.email}</span>
                    )}
                </div>
                {/* Phone */}
                <div className="form-group col-lg-6">
                    <label>Mobile Number*</label>
                    
                    <div className="phone-row">
                        <div className="phone-field">
                            <span className="country-code">+91</span>

                            <input
                                type="tel"
                                name="phone"
                                value={data.phone}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");

                                    setData({ ...data, phone: value });

                                    let errorMsg = "";

                                    if (!value) errorMsg = "Phone is required";
                                    else if (!/^[0-9]{10}$/.test(value))
                                        errorMsg = "Enter valid 10 digit number";

                                    setErrors({
                                        ...errors,
                                        phone: errorMsg,
                                    });
                                }}
                                placeholder="10 digit number"
                                maxLength={10}
                                style={{ borderTopLeftRadius: "0px", borderBottomLeftRadius: "0px" }}
                            />
                        </div>


                    </div>

                    {errors.phone && (
                        <span className="text-danger small error">{errors.phone}</span>
                    )}
                </div>
                {/* Designation */}
                <div className="form-group col-lg-6">
                    <label>Designation *</label>
                    <input
                        type="text"
                        name="designation"
                        value={data.designation}
                        onChange={handleChange}
                        placeholder="HR / Manager / Founder"
                    />
                    {errors.designation && (
                        <span className="text-danger small error">{errors.designation}</span>
                    )}
                </div>



                {/* Button */}
                <div className="form-group col-lg-12 d-flex justify-content-end mt-3">
                    <button
                        type="button"
                        className="theme-btn btn-style-one"
                        onClick={handleNext}>
                        Next
                    </button>
                </div>

            </div>
        </form>
    );
};

export default PersonalDetailsForm;