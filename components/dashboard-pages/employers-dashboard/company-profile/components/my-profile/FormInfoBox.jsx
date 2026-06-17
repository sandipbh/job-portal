'use client';

import { useState, forwardRef, useImperativeHandle } from "react";
import Select from "react-select";
import AboutEditor from "./AboutEditor";
const FormInfoBox = forwardRef((props, ref) => {

    const catOptions = [
        { value: "Advertising/Banking", label: "Advertising/Banking" },
        { value: "Digital & Creative", label: "Digital & Creative" },
        { value: "Retail", label: "Retail" },
        { value: "Human Resources", label: "Human Resources" },
        { value: "Management", label: "Management" },
        { value: "Accounting & Finance", label: "Accounting & Finance" },
        { value: "Digital", label: "Digital" },
        { value: "Creative Art", label: "Creative Art" },
    ];
    const indianStates = [
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chhattisgarh",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal",
        "Andaman and Nicobar Islands",
        "Chandigarh",
        "Dadra and Nagar Haveli and Daman and Diu",
        "Delhi",
        "Jammu and Kashmir",
        "Ladakh",
        "Lakshadweep",
        "Puducherry",
    ];
    const [data, setData] = useState({
        name: "",
        website: "",
        about: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        industry: [],
        employees: "",
        allow: "",
    });

    const [errors, setErrors] = useState({});

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;

        setData({ ...data, [name]: value });

        // Remove error on typing
        setErrors({ ...errors, [name]: "" });
    };

    // Handle Select
    const handleSelect = (selected) => {
        setData({ ...data, industry: selected });
        setErrors({ ...errors, industry: "" });
    };

    // Validation
    const validate = () => {
        let newErrors = {};

        if (!data.name || data.name.length < 3) newErrors.name = "Company name is required";
        if (!data.about  || data.about.length < 10) newErrors.about = "About company is required";
        if (!data.address || data.address.length < 10) newErrors.address = "Address is required";
        if (!data.city || data.city.length < 3) newErrors.city = "City is required";
        if (!data.state || data.state.length < 3) newErrors.state = "State is required";

        if (!data.pincode) {
            newErrors.pincode = "Pincode is required";
        } else if (!/^[0-9]{6}$/.test(data.pincode)) {
            newErrors.pincode = "Enter valid 6 digit pincode";
        }
        if (!data.industry.length) newErrors.industry = "Select at least one industry";
        if (!data.employees) newErrors.employees = "Select employee size";
        if (!data.allow) newErrors.allow = "Please select option";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Expose validate to parent
    useImperativeHandle(ref, () => ({
        validate,
    }));

    return (
        <form className="default-form">
            <div className="row">

                {/* Company Name */}
                <div className="form-group col-lg-6">
                    <label>Company name *</label>
                    <input
                        type="text"
                        name="name"
                        value={data.name}
                        onChange={handleChange}
                        placeholder="Invision"
                    />
                    {errors.name && <span className="text-danger small error">{errors.name}</span>}
                </div>

                {/* Website */}
                <div className="form-group col-lg-6">
                    <label>Website</label>
                    <input
                        type="text"
                        name="website"
                        value={data.website}
                        onChange={handleChange}
                        placeholder="www.invision.com"
                    />
                </div>

                {/* Address */}
                <div className="form-group col-lg-6">
                    <label>Company Address *</label>
                    <input
                        type="text"
                        name="address"
                        value={data.address}
                        onChange={handleChange}
                        placeholder="Enter address"
                    />
                    {errors.address && <span className="text-danger small error">{errors.address}</span>}
                </div>

                {/* city */}
                <div className="form-group col-lg-6">
                    <label> City *</label>
                    <input
                        type="text"
                        name="city"
                        value={data.city}
                        onChange={handleChange}
                        placeholder="Enter city"
                        maxLength={50}
                    />
                    {errors.city && <span className="text-danger small error">{errors.city}</span>}
                </div>
                {/* State */}
                <div className="form-group col-lg-6">
                    <label> State *</label>
                    <select name="state" className="state-select"  onChange={handleChange}>
                        <option value="">Select State</option>

                        {indianStates.map((state) => (
                            <option key={state} value={state}>
                                {state}
                            </option>
                        ))}
                    </select>
                    
                    {errors.state && <span className="text-danger small error">{errors.state}</span>}
                </div>
                 
                {/* Pincode */}
                <div className="form-group col-lg-6">
                    <label> Pin code *</label>
                    <input
                        type="text"
                        name="pincode"
                        value={data.pincode}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setData({ ...data, pincode: val });
                            setErrors({ ...errors, pincode: "" });
                        }}
                        maxLength={6}
                        placeholder="Enter pincode"
                    />
                    {errors.pincode && <span className="text-danger small error">{errors.pincode}</span>}
                </div>

                {/* Industry */}
                <div className="form-group col-lg-6">
                    <label>Industry *</label>
                    <Select
                        isMulti
                        classNamePrefix="custom-select"
                        options={catOptions}
                        value={data.industry}
                        onChange={handleSelect}
                    />
                    {errors.industry && <span className="text-danger small error">{errors.industry}</span>}
                </div>

                {/* Employees */}
                <div className="form-group col-lg-6">
                    <label>No. of Employee *</label>
                    <select
                        name="employees"
                        value={data.employees}
                        onChange={handleChange}
                    >
                        <option value="">Select</option>
                        <option>0-1</option>
                        <option>2-10</option>
                        <option>11-15</option>
                        <option>51-200</option>
                        <option>500-1000</option>
                        <option>1000+</option>
                    </select>
                    {errors.employees && <span className="text-danger small error">{errors.employees}</span>}
                </div>

                {/* Allow */}
                <div className="form-group col-lg-6">
                    <label>Allow In Search & Listing *</label>
                    <select
                        name="allow"
                        value={data.allow}
                        onChange={handleChange}
                    >
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                    </select>
                    {errors.allow && <span className="text-danger small error">{errors.allow}</span>}
                </div>

                {/* About */}
                <div className="form-group col-lg-12">
                    <label>About Company *</label>
                    <AboutEditor data={data} setData={setData} errors={errors} />
                    {errors.about && <span className="text-danger small error">{errors.about}</span>}
                </div>

            </div>
        </form>
    );
});

export default FormInfoBox;