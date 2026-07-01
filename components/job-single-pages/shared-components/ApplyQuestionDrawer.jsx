"use client";

//import applicationQuestions from "@/data/applicationQuestions";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const ApplyQuestionDrawer = ({
    show,
    onClose,
    answers,
    setAnswers,
    currentQuestion,
    setCurrentQuestion,
    completedQuestions,
    setCompletedQuestions,
    onSubmit,
    resume,
    setResume,
    errors,
    setErrors,
    jobId
}) => {

    const [typing, setTyping] = useState(false);
    const [applicationQuestions, setApplicationQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fullName, setFullName] = useState("");
    const [loginType, setLoginType] = useState("");
    const [loginUqid, setLoginUqid] = useState("");

    useEffect(() => {
        getQuestionsList();
    }, []);



    const getQuestionsList = async () => {
        try {

            const response = await fetch(`/api/job-details-questions?JobPostId=${jobId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            const result = await response.json();

            const listData = result?.data;
            console.log('Job Details Questions ', JSON.stringify(listData))

            if (listData) {

                setApplicationQuestions(listData);
                setLoading(false);
            }

        } catch (error) {
            console.error(error);
        }
    };

    const chatEndRef = useRef(null);
    useEffect(() => {

        const timer = setTimeout(() => {

            chatEndRef.current?.scrollIntoView({
                behavior: "smooth",
            });

        }, 120);

        return () => clearTimeout(timer);

    }, [completedQuestions, currentQuestion]);

    if (!show) return null;

    const question = applicationQuestions[currentQuestion];

    const handleNext = () => {

        if (question.type === "file" && !resume) {
            setErrors((prev) => ({
                ...prev,
                resume: "Please upload your resume.",
            }));
            return;
        }
        setCompletedQuestions((prev) => [
            ...prev,
            {
                question: question.question,
                answer:
                    question.type === "file"
                        ? resume?.name || "Skipped"
                        : answers[question.key] || "Skipped",
            },
        ]);

        if (currentQuestion === applicationQuestions.length - 1) {
            onSubmit();
            document.getElementById("applyModalCloseBtn")?.click();
            return;
        }

        setTyping(true);

        setTimeout(() => {
            setTyping(false);
            setCurrentQuestion((prev) => prev + 1);
        }, 700);
    };

    const handleSkip = () => {
        setCompletedQuestions((prev) => [
            ...prev,
            {
                question: question.question,
                answer: "Skipped",
            },
        ]);

        if (currentQuestion === applicationQuestions.length - 1) {
            onSubmit();
            return;
        }

        setTyping(true);

        setTimeout(() => {
            setTyping(false);
            setCurrentQuestion((prev) => prev + 1);
        }, 700);
    };

    const handlePrevious = () => {
        if (currentQuestion === 0) return;

        setCurrentQuestion((prev) => prev - 1);

        setCompletedQuestions((prev) =>
            prev.slice(0, prev.length - 1)
        );
    };

    return (
        <>
            <div className="drawer-overlay" onClick={onClose}></div>

            <div className={`question-drawer ${show ? "open" : ""}`}>

                {/* Header */}
                <div className="drawer-header">
                    <h4>Complete Application</h4>
                    <button
                        type="button"
                        className="close-btn"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                {/* Progress */}
                <div className="progress-wrapper">
                    <div className="progress-text">
                        Question {currentQuestion + 1} of {applicationQuestions.length}
                    </div>

                    <div className="progress-bar-custom">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${((currentQuestion + 1) /
                                    applicationQuestions.length) *
                                    100
                                    }%`,
                            }}
                        ></div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="drawer-chat">

                    {/* Intro */}
                    <div className="bot-message intro">
                        Hi {fullName} 👋
                        <br />
                        The recruiter needs some profile information.
                        <br />
                        Your answers will be used while applying.
                    </div>

                    {/* Previous Questions */}
                    {completedQuestions.map((item, index) => (
                        <div key={index} className="chat-message">

                            <div className="bot-message">
                                {item.question}
                            </div>

                            <div className="user-message">
                                {item.answer}
                            </div>

                        </div>
                    ))}

                    {/* Typing */}
                    {typing ? (
                        <div className="typing">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    ) : (
                        <>
                            {/* Current Question */}
                            <div className="bot-message">
                                {question.question}

                                {console.log("Question Options ", question.options)}
                            </div>

                            <div className="question-options">

                                {question.type === "text" && (
                                    <input
                                        className="form-control"
                                        value={answers[question.key] || ""}
                                        onChange={(e) =>
                                            setAnswers({
                                                ...answers,
                                                [question.key]: e.target.value,
                                            })
                                        }
                                    />
                                )}

                                {question.type === "radio" &&


                                    question.options?.map((option) => (
                                        <label
                                            key={option}
                                            className={`option-card ${answers[question.key] === option ? "active" : ""
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={question.key}
                                                value={option}
                                                checked={answers[question.key] === option}
                                                onChange={(e) =>
                                                    setAnswers({
                                                        ...answers,
                                                        [question.key]: e.target.value,
                                                    })
                                                }
                                            />

                                            <span>{option}</span>
                                        </label>
                                    ))
                                }

                                {question.type === "select" && (
                                    <select
                                        className="form-control"
                                        value={answers[question.key] || ""}
                                        onChange={(e) =>
                                            setAnswers({
                                                ...answers,
                                                [question.key]: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Select</option>

                                        {question.options.map((option) => (
                                            <option key={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {question.type === "file" && (
                                    <>
                                        <div className="uploading-outer apply-cv-outer">

                                            <div className="uploadButton">

                                                <input
                                                    className="uploadButton-input"
                                                    id="resumeUpload"
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];

                                                        if (!file) return;

                                                        const allowedTypes = [
                                                            "application/pdf",
                                                            "application/msword",
                                                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                                        ];

                                                        if (!allowedTypes.includes(file.type)) {
                                                            setErrors((prev) => ({
                                                                ...prev,
                                                                resume: "Only PDF, DOC and DOCX allowed.",
                                                            }));
                                                            return;
                                                        }

                                                        if (file.size > 5 * 1024 * 1024) {
                                                            setErrors((prev) => ({
                                                                ...prev,
                                                                resume: "Maximum file size is 5MB.",
                                                            }));
                                                            return;
                                                        }

                                                        setResume(file);

                                                        setErrors((prev) => ({
                                                            ...prev,
                                                            resume: "",
                                                        }));
                                                    }}
                                                />

                                                <label
                                                    htmlFor="resumeUpload"
                                                    className="uploadButton-button ripple-effect"
                                                >
                                                    Upload Resume
                                                </label>

                                            </div>

                                            {resume && (
                                                <div className="file-name mt-3">
                                                    📄 {resume.name}
                                                </div>
                                            )}

                                            {errors.resume && (
                                                <div className="error-text">
                                                    {errors.resume}
                                                </div>
                                            )}

                                        </div>
                                    </>
                                )}

                            </div>
                        </>
                    )}

                    <div ref={chatEndRef}></div>

                </div>

                {/* Footer */}
                <div className="drawer-footer">

                    <button
                        type="button"
                        className="btn btn-light"
                        disabled={currentQuestion === 0}
                        onClick={handlePrevious}
                    >
                        Previous
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleSkip}
                    >
                        Skip
                    </button>

                    <button
                        type="button"
                        className="theme-btn btn-style-one"
                        onClick={handleNext}
                    >
                        {currentQuestion ===
                            applicationQuestions.length - 1
                            ? "Submit"
                            : "Next"}
                    </button>

                </div>

            </div>
        </>
    );
};

export default ApplyQuestionDrawer;