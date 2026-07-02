"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ApplyQuestionDrawer from "./ApplyQuestionDrawer";
import { toast } from "react-toastify";


const ApplyJobModalContent = ({ id }) => {

  let jobId = id ?? 0;


  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [loginType, setLoginType] = useState("");
  const [loginUqid, setLoginUqid] = useState("");


  useEffect(() => {
    getCookiesValue();
  }, []);

  const getCookiesValue = async () => {
    try {
      const response = await fetch("/api/cookies-details", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      const data = await response.json();
      const fullname = data?.fullname ?? "";
      const role = data?.role ?? "";
      const uqid = data?.uqid ?? "";


      setFullName(fullname);
      setLoginType(role);
      setLoginUqid(uqid);

      // if (!fullname || !role || !uqid) {
      //   toast.error("Login information is missing. Please log in again.");
      //   return;
      // }

      // if (role != "candidate") {
      //   toast.error("Login information is missing. Please log in as candidate.");
      //   return;
      // }



    } catch (error) {
      console.error(error);
    }
  };


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

    if (!resume || resume.size === 0) {
      newErrors.resume = "Please upload your resume.";
    }

    if (!message.trim() || message.length < 10) {
      newErrors.message = "Please enter a message.";
    }

    if (!accepted) {
      newErrors.accepted = "Please accept Terms & Conditions.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    // document.getElementById("applyModalCloseBtn")?.click();

    // setTimeout(() => {
    //   setShowDrawer();
    // }, 300);

    setShowDrawer(true);
  };

  const handleFinalApply = () => {
    console.log({
      resume,
      message,
      answers,
    });

    setShowDrawer(false);

    // const modal = document.getElementById("applyJobModal");
    // const modalInstance = window.bootstrap?.Modal?.getInstance(modal);
    // modalInstance?.hide();

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
        <div className="col-lg-12  mb-4 ">
          <div className="uploading-outer apply-cv-outer">

            {resume && (
              <div className="mt-2 file-name text-center">
                {resume.name}
              </div>
            )}
            <div className="uploadButton">

              <input
                className="uploadButton-input d-none"
                type="file"
                id="upload"
                accept=".pdf"
                onChange={handleResumeChange}
              />

              <label
                className="uploadButton-button ripple-effect"
                htmlFor="upload"
              >
                Upload CV (PDF)
              </label>
            </div>

            {errors.resume && (
              <div className="error-text">
                {errors.resume}
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        <div className="col-lg-12 form-group">
          <textarea
            className="darma"
            placeholder="Tell recruiter about your skills, experience, and qualifications..."
            value={message}
            maxLength={500}
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
          <div className="d-flex justify-content-between align-items-center">
            <div>
              {errors.message && (
                <div className="error-text">
                  {errors.message}
                </div>
              )}
            </div>
            <div
              style={{
                textAlign: "right",
                fontSize: "13px",
                color: message.length >= 500 ? "red" : "#666",
                marginTop: "5px",
              }}
            >
              <span className="error-text">  {message.length}/500 characters</span>
            </div>

          </div>


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

          {errors.accepted && (
            <div className="error-text">
              {errors.accepted}
            </div>
          )}
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
        jobId={jobId}
      />
    </form >
  );
};

export default ApplyJobModalContent;