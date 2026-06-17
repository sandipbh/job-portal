"use client";

import { useState } from "react";

const Form = () => {
  const [formData, setFormData] = useState({
    OldPassword: "",
    NewPassword: "",
    ConfirmPassword: "",
  });

  const [alertType, setAlertType] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=]).{6,}$/;

    if (!formData.OldPassword.trim()) {
      newErrors.OldPassword = "Old password is required";
    }

    if (!formData.NewPassword.trim()) {
      newErrors.NewPassword = "New password is required";
    } else if (formData.NewPassword.length < 6) {
      newErrors.NewPassword =
        "New password must be at least 6 characters";
    }

    if (!formData.ConfirmPassword.trim()) {
      newErrors.ConfirmPassword = "Confirm password is required";
    } else if (
      formData.NewPassword !== formData.ConfirmPassword
    ) {
      newErrors.ConfirmPassword =
        "Confirm password does not match";
    }

    if (!formData.NewPassword.trim()) {
      newErrors.NewPassword = "New password is required";
    } else if (!passwordRegex.test(formData.NewPassword)) {
      newErrors.NewPassword =
        "Password must contain at least 6 characters, one uppercase letter, one lowercase letter, one number and one special character";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!validateForm()) return;

    try {
      setLoading(true);

      const response = await fetch("/api/candi-change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          OldPassword: formData.OldPassword,
          NewPassword: formData.NewPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setAlertType("success");
        setMessage(result.message || "Password changed successfully");

        setFormData({
          OldPassword: "",
          NewPassword: "",
          ConfirmPassword: "",
        });
      } else {
        setAlertType("danger");
        setMessage(result.message || "Failed to change password");
      }
    } catch (error) {
      setAlertType("danger");
      setMessage("Something went wrong");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="default-form" onSubmit={handleSubmit}>
      <div className="row">
       {message && (
  <div className="col-lg-12 mb-3">
    <div
      className={`alert alert-${alertType} alert-dismissible fade show`}
      role="alert"
    >
      {message}

      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={() => {
          setMessage("");
          setAlertType("");
        }}
      ></button>
    </div>
  </div>
)}
        <div className="form-group col-lg-7 col-md-12">
          <label>Old Password</label>
          <input
            type="password"
            name="OldPassword"
            value={formData.OldPassword}
            onChange={handleChange}
            placeholder="Enter your old password"
          />
          {errors.OldPassword && (
            <small className="text-danger">
              {errors.OldPassword}
            </small>
          )}
        </div>

        <div className="form-group col-lg-7 col-md-12">
          <label>New Password</label>
          <input
            type="password"
            name="NewPassword"
            value={formData.NewPassword}
            onChange={handleChange}
            placeholder="Enter your new password"
          />
          {errors.NewPassword && (
            <small className="text-danger">
              {errors.NewPassword}
            </small>
          )}
        </div>

        <div className="form-group col-lg-7 col-md-12">
          <label>Confirm Password</label>
          <input
            type="password"
            name="ConfirmPassword"
            value={formData.ConfirmPassword}
            onChange={handleChange}
            placeholder="Confirm your new password"
          />
          {errors.ConfirmPassword && (
            <small className="text-danger">
              {errors.ConfirmPassword}
            </small>
          )}
        </div>



        <div className="form-group col-lg-6 col-md-12 mt-3">
          <button
            type="submit"
            className="theme-btn btn-style-one"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default Form;