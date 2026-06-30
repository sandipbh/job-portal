"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ApplyQuestionDrawer from "./ApplyQuestionDrawer";
import { toast } from "react-toastify";


const ApplyJobModalContent = () => {
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleResumeChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setResume(null);

      setErrors((prev) => ({
        ...prev,
        resume: "Only PDF, DOC and DOCX files are allowed.",
      }));

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResume(null);

      setErrors((prev) => ({
        ...prev,
        resume: "File size must be less than 5MB.",
      }));

      e.target.value = "";
      return;
    }

    setResume(file);

    setErrors((prev) => ({
      ...prev,
      resume: "",
    }));
  };

  const resetForm = () => {
    setResume(null);
    setMessage("");
    setAccepted(false);
    setErrors({});

    const fileInput = document.getElementById("upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!resume) {
      newErrors.resume = "Please upload your resume.";
    }

    if (!message.trim()) {
      newErrors.message = "Please enter a message.";
    }

    if (!accepted) {
      newErrors.accepted = "Please accept Terms & Conditions.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    // Open Question Modal
    setShowDrawer(true);
  };

  const handleFinalApply = () => {
    console.log({
      resume,
      message,
      answers,
    });

    setShowDrawer(false);

    // Swal.fire({
    //   toast: true,
    //   position: "top-end",
    //   icon: "success",
    //   title: "Applied Successfully",
    //   timer: 1500,
    //   showConfirmButton: false,
    // });
    toast.success("Applied Successfully")

    resetForm();
  };

  useEffect(() => {
    const modal = document.getElementById("applyJobModal");

    const handleModalClose = () => {
      resetForm();
    };

    modal?.addEventListener(
      "hidden.bs.modal",
      handleModalClose
    );

    return () => {
      modal?.removeEventListener(
        "hidden.bs.modal",
        handleModalClose
      );
    };
  }, []);

  const [showDrawer, setShowDrawer] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answers, setAnswers] = useState({});

  const [completedQuestions, setCompletedQuestions] = useState([]);
  return (
    <form
      className="default-form job-apply-form"
      onSubmit={handleSubmit}
    >
      <div className="row">
        {/* Resume Upload */}
        <div className="col-lg-12 form-group">
          <div className="uploading-outer apply-cv-outer">
            <div className="uploadButton">
              <input
                className="uploadButton-input"
                type="file"
                id="upload"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeChange}
              />

              <label
                className="uploadButton-button ripple-effect"
                htmlFor="upload"
              >
                Upload CV (DOC, DOCX, PDF)
              </label>
            </div>

            {/* {resume && (
              <div className="mt-2 file-name">
                {resume.name}
              </div>
            )}

            {errors.resume && (
              <div className="error-text">
                {errors.resume}
              </div>
            )} */}
          </div>
        </div>

        {/* Message */}
        <div className="col-lg-12 form-group">
          <textarea
            className="darma"
            placeholder="Tell recruiter about your skills, experience, and qualifications..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);

              if (errors.message) {
                setErrors((prev) => ({
                  ...prev,
                  message: "",
                }));
              }
            }}
          />
          {/* {errors.message && (
            <div className="error-text">
              {errors.message}
            </div>
          )} */}

        </div>

        {/* Terms */}
        <div className="col-lg-12 form-group">
          <div className="input-group checkboxes square">
            <input
              type="checkbox"
              id="rememberMe"
              checked={accepted}
              onChange={(e) => {
                setAccepted(e.target.checked);

                if (errors.accepted) {
                  setErrors((prev) => ({
                    ...prev,
                    accepted: "",
                  }));
                }
              }}
            />

            <label htmlFor="rememberMe" className="remember">
              <span className="custom-checkbox"></span>
              You accept our{" "}
              <span data-bs-dismiss="modal">
                <Link href="/terms">
                  Terms and Conditions and Privacy Policy
                </Link>
              </span>
            </label>
          </div>
          {/* 
          {errors.accepted && (
            <div className="error-text">
              {errors.accepted}
            </div>
          )} */}
        </div>

        {/* Submit */}
        <div className="col-lg-12 form-group">
          <button
            className="theme-btn btn-style-one w-100"
            type="submit"
          >
            Apply Job
          </button>
        </div>
      </div>
      <ApplyQuestionDrawer
        show={showDrawer}
        onClose={() => setShowDrawer(false)}
        answers={answers}
        setAnswers={setAnswers}
        currentQuestion={currentQuestion}
        setCurrentQuestion={setCurrentQuestion}
        completedQuestions={completedQuestions}
        setCompletedQuestions={setCompletedQuestions}
        onSubmit={handleFinalApply}
        resume={resume}
        setResume={setResume}
        errors={errors}
        setErrors={setErrors}
      />
    </form>
  );
};

export default ApplyJobModalContent;