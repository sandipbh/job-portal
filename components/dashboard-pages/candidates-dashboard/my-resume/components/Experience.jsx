'use client'
import { useState, useEffect } from "react";
import { toast } from 'react-toastify';

const ExperienceForm = ({ data, setData, onNext }) => {

  const emptyExperience = {
    designation: "",
    company: "",
    location: "",
    workingStartMonth: "",
    workingStartYear: "",
    workingEndMonth: "",
    workingEndYear: "",
    currentlyWorking: true,
    description: "",
  };

  const [form, setForm] = useState(emptyExperience);
  const [list, setList] = useState(data.experience || []);

  const [showForm, setShowForm] = useState(
    (data.experience || []).length === 0
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    getExperienceDetails();
  }, []);

  const getExperienceDetails = async () => {
    try {
      const response = await fetch("/api/candi-experience", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const result = await response.json();

      const profile = result?.data;

      if (profile) {

        const examList = profile.map(item => ({

          designation: item.designation,
          company: item.companyName,
          location: item.location,
          workingStartMonth: item.fromMonth,
          workingStartYear: item.fromYear,
          workingEndMonth: item.toMonth,
          workingEndYear: item.toYear,
          currentlyWorking: item.currentCompany,
          description: item.workProfile,

        }));
        setList(examList);

        setForm(emptyExperience);
        setEditIndex(null);
        setShowForm(false);
      }
    } catch (error) {
      console.error(error);
    }
  };





  const saveExperience = async () => {
    const isValid = validateForm();
    console.log(isValid)
    if (!isValid) {
      return;
    }


    try {

      setLoading(true);

      const res = await fetch("/api/candi-experience", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
        }),
      });

      const user = await res.json();
      console.log("Response from /api/candi-experience:", user);

      if (!res.ok) {
        toast.error(user.message || "Profile update failed");
        setLoading(false);
        return;
      }
      /*** set list** */
      let updated;

      if (editIndex !== null) {
        updated = [...list];
        updated[editIndex] = form;
        setEditIndex(null);
      } else {
        updated = [...list, form];
      }

      setList(updated);

      setData((prev) => ({
        ...prev,
        experience: updated,
      }));

      setForm(emptyExperience);
      setErrors({});
      setShowForm(false);

      /*** set list** */

      toast.success(user.message);
    } catch (error) {
      console.error(error);
      toast.error("Save  failed. Please try again.");
    } finally {
      setLoading(false);
    }



  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    let newErrors = {};

    if (!form.designation.trim()) {
      newErrors.designation = "Designation is required";
    }

    if (!form.company.trim()) {
      newErrors.company = "Company name is required";
    }

    if (!form.workingStartMonth || form.workingStartMonth.length < 3) {
      newErrors.workingStartMonth = "Select start month";
    }

    if (!form.workingStartYear || form.workingStartYear.length < 4) {
      newErrors.workingStartYear = "Select start year";
    }

    if (!form.currentlyWorking) {
      if (!form.workingEndMonth || form.workingEndMonth.length < 3) {
        newErrors.workingEndMonth = "Select end month";
      }

      if (!form.workingEndYear || form.workingEndYear.length < 4) {
        newErrors.workingEndYear = "Select end year";
      }
    }

    if (!form.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!form.description.trim()) {
      newErrors.description = "Job description is required";
    }
    if (form.description.trim().length < 10) {
      newErrors.description = "Description your work";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  //  ADD / UPDATE
  const handleAdd = () => {
    if (editIndex !== null) {
      const updated = [...list];
      updated[editIndex] = form;
      setList(updated);
      setEditIndex(null);
    } else {
      setList([...list, form]);
    }

    setForm({
      designation: "",
      company: "",
      location: "",
      startYear: "",
      endYear: "",
      currentlyWorking: false,
      description: ""
    });
  };

  //  EDIT
  const handleEdit = (index) => {
    setForm({ ...list[index] });
    setEditIndex(index);
    setShowForm(true);
  };

  const handleCancel = () => {
    setForm(emptyExperience);
    setEditIndex(null);
    setShowForm(false);
  };

  //  DELETE
  const confirmDelete = () => {
    setList(list.filter((_, i) => i !== deleteIndex));
    setDeleteIndex(null);

    setToast("Deleted successfully");
    setTimeout(() => setToast(""), 2500);
  };

  // FINAL SAVE
  const handleSubmit = (e) => {
    e.preventDefault();

    if (list.length === 0) {
      setErrors({
        experience:
          "Please add at least one work experience",
      });
      return;
    }

    setData((prev) => ({
      ...prev,
      experience: list,
    }));

    onNext();
  };

  const currentYear = new Date().getFullYear();

  const months = [
    { key: 1, value: "January" },
    { key: 2, value: "February" },
    { key: 3, value: "March" },
    { key: 4, value: "April" },
    { key: 5, value: "May" },
    { key: 6, value: "June" },
    { key: 7, value: "July" },
    { key: 8, value: "August" },
    { key: 9, value: "September" },
    { key: 10, value: "October" },
    { key: 11, value: "November" },
    { key: 12, value: "December" }
  ];

  const startYear = Number(form.startYear);
  const minEndYear = startYear || 2000;
  const maxYear = currentYear;


  return (
    <form className="default-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h4>Work Experience</h4>
        <p>Add Employment details if you are already working / have worked before in an organization</p>
      </div>

      {!showForm && (
        <button
          type="button"
          className="btn btn-sm btn-style-four mb-4"
          onClick={() => {
            setForm(emptyExperience);
            setEditIndex(null);
            setShowForm(true);
          }}
        >
          + Add Work Experience
        </button>
      )}

      {list.map((item, index) => (
        <div key={index} className="exam-card" style={{ marginBottom: "10px" }}>

          <div className="d-flex justify-content-between align-items-start">

            <div>
              <h5>{item.designation}</h5>

              <p className="mb-1">
                {item.company} ,  {item.location}
              </p>
              <p className="mb-0">
                From {item.workingStartMonth}, {item.workingStartYear} - {" "}
                {item.currentlyWorking
                  ? "Present"
                  : `${item.workingEndMonth}, ${item.workingEndYear}`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleEdit(index)}
            >
              ✏️
            </button>

          </div>

        </div>
      ))}

      {showForm && (
        <>
          <div className="exam-form-box">
            <div className="row">
              {/* DESIGNATION */}
              <div className="form-group col-lg-6 col-md-12">
                <label>Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  placeholder="Enter Designation"
                  maxLength={100}
                />

                {errors.designation && (
                  <span className="error-text">{errors.designation}</span>
                )}
              </div>

              {/* COMPANY */}
              <div className="form-group col-lg-6 col-md-12">
                <label>Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Enter Company Name"
                  maxLength={100}
                />
                {errors.company && (
                  <span className="error-text">{errors.company}</span>
                )}
              </div>


              {/* WORKING SINCE */}
              <div className="form-group col-12 mt-2">
                <label>Working Since</label>

                {/* START DATE */}
                <div className="row">
                  <div className="form-group col-lg-6 col-md-6">
                    <label>Start Month</label>
                    <select
                      name="workingStartMonth"
                      value={form.workingStartMonth || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select Month</option>
                      {months.map((m, index) => (
                        <option key={index} value={m.id} >{m.value}</option>
                      ))}
                    </select>

                    {errors.workingStartMonth && (
                      <span className="error-text">
                        {errors.workingStartMonth}
                      </span>
                    )}
                  </div>

                  <div className="form-group col-lg-6 col-md-6">
                    <label>Start Year</label>
                    <select
                      name="workingStartYear"
                      value={form.workingStartYear || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select Year</option>

                      {Array.from(
                        { length: currentYear - 1999 },
                        (_, i) => currentYear - i
                      ).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    {errors.workingStartYear && (
                      <span className="error-text">
                        {errors.workingStartYear}
                      </span>
                    )}
                  </div>
                </div>
                {/* CHECKBOX */}
                <div className="mt-2">
                  <label className="d-flex align-items-center gap-2">
                    <input
                      type="checkbox"
                      name="currentlyWorking"
                      checked={form.currentlyWorking}
                      onChange={handleChange}
                    />
                    Currently Working Here
                  </label>
                </div>
                {/* END DATE */}
                {!form.currentlyWorking && (
                  <div className="row">
                    <div className="form-group col-lg-6 col-md-6">
                      <label>End Month</label>

                      <select
                        name="workingEndMonth"
                        value={form.workingEndMonth || ""}
                        onChange={handleChange}
                      >
                        <option value="">Select Month</option>

                        {months.map((m, index) => (
                          <option key={index} value={m.id} >{m.value}</option>
                        ))}
                      </select>

                      {errors.workingEndMonth && (
                        <span className="error-text">
                          {errors.workingEndMonth}
                        </span>
                      )}
                    </div>

                    <div className="form-group col-lg-6 col-md-6">
                      <label>End Year</label>

                      <select
                        name="workingEndYear"
                        value={form.workingEndYear || ""}
                        onChange={handleChange}
                        disabled={!form.workingStartYear}
                      >
                        <option value="">Select Year</option>

                        {form.workingStartYear &&
                          Array.from(
                            {
                              length:
                                currentYear -
                                Number(form.workingStartYear) +
                                1,
                            },
                            (_, i) =>
                              Number(form.workingStartYear) + i
                          ).map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                      </select>

                      {errors.workingEndYear && (
                        <span className="error-text">
                          {errors.workingEndYear}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* PRESENT */}

              </div>

              {/* LOCATION */}
              <div className="form-group col-lg-6 col-md-12">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Enter Working Location"
                />
                {errors.location && (
                  <span className="error-text">{errors.location}</span>
                )}
              </div>

              {/* DESCRIPTION */}
              <div className="form-group col-12">
                <label>Describe your job profile</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  placeholder="Write a brief description of your job.."
                  className="about-input-company"
                />
                {errors.description && (
                  <span className="error-text">{errors.description}</span>
                )}
              </div>

              <div className="d-flex gap-3 mt-4">

                <button
                  type="button"
                  className="btn btn-md btn-primary  me-3"
                  onClick={() => saveExperience()}
                  disabled={loading}
                >
                  {loading ? "Saving....." : "Save"}
                </button>

                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

              </div>

            </div>
          </div>
        </>
      )}

      {/* SAVE */}
      <div className="text-end mt-3">
        <button type="submit" className="theme-btn btn-style-one">
          Save & Continue
        </button>
      </div>
    </form>
  );
};

export default ExperienceForm;