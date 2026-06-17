'use client';

import { useState, useEffect } from "react";
import { useRef } from "react";
import { toast } from 'react-toastify';


const CompetitiveExam = ({
    data,
    setData,
    onNext,
    prev
}) => {

    const formRef = useRef(null);
    const emptyExam = {
        examId: "",
        examName: "",
        year: "",
        score: ""
    };
    const [exam, setExam] = useState(emptyExam);

 
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [examListApi, setExamListApi] = useState([]);

    const [examList, setExamList] = useState(
        data.competitiveExams || []
    );

    const currentYear = new Date().getFullYear();

    const getExams = async () => {

        console.log("Fetching exams for term:");
        try {

            const response = await fetch("/api/list-exams", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    term: '',
                }),
            });

            const data = await response.json();
            console.log("exam fetched:", JSON.stringify(data.data));

            setExamListApi(data && data.data ? data.data : []);

        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        getExams();
    }, [0]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setExam((prev) => ({
            ...prev,
            [name]: value,
        }));

    };

    const addExam = () => {
        if (!exam.examName.trim()) {
            alert("Please enter exam name");
            return;
        }
        const updatedList = [...examList, exam];

        setExamList(updatedList);
        setExam(emptyExam);
    };

    const removeExam = (index) => {
        const updatedList = examList.filter(
            (_, i) => i !== index
        );
        setExamList(updatedList);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setData((prev) => ({
            ...prev,
            competitiveExams: examList,
        }));

        onNext();
    };

    const [showForm, setShowForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);

    const editExam = (index) => {
        setExam(examList[index]);
        setEditingIndex(index);
    };

    

    const saveExam = async (type) => {

        if(type==="save"){
        const isExamExists = examList.some(
            (item) => item.examId === exam.examId
        );

        if (isExamExists) {
            toast.error(`${exam.examName} already exists`);
            return true;
        }  
        }
        let newErrors = {};
         
        if (!exam.examName?.trim()) {
            newErrors.examName = "Select exam";
        }
        if (!exam.examId?.trim()) {
            newErrors.examName = "Select exam";
        }
        if (!exam.year?.trim()) {
            newErrors.year = "Select year";
        }
        if (!exam.score?.trim()) {
            newErrors.score = "Enter rank/score";
        }
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
           
            try {

                setLoading(true);

                const res = await fetch("/api/candi-competitive-exam", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...exam,
                    }),
                });

                const user = await res.json();
                console.log("Response from /api/candi-competitive-exam:", user);

                if (!res.ok) {
                    toast.error(user.message || "Profile update failed");
                    setLoading(false);
                    return;
                }
                /*** set list** */
            if (editingIndex !== null) {
                const updated = [...examList];
                updated[editingIndex] = exam;
                setExamList(updated);
                // close edit mode
                setEditingIndex(null);
            } else {
                setExamList([...examList, exam]);
                setShowForm(false);
            }
               /*** set list** */
                setExam(emptyExam);

                toast.success(user.message);
            } catch (error) {
                console.error(error);
                toast.error("Save  failed. Please try again.");
            } finally {
                setLoading(false);
            }
 
        }
    };
    const handleAddExam = () => {
        setExam(emptyExam);
        setEditingIndex(null);
        setShowForm(true);

        setTimeout(() => {
            formRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 100);
    };

    return (
        <form
            className="competitive-exam-section"
            onSubmit={handleSubmit}
        >

            {/* Header */}
            <div className="exam-header">
                <div>
                    <h4>Competitive Exam Results</h4>
                    <p>Talk about your outstanding results in competitive exams</p>
                </div>

                <button
                    type="button"
                    className="btn-sm add-exam-btn"
                    onClick={handleAddExam}
                >
                    Add Competitive Exam
                </button>
            </div>

            {/* Saved Exams */}
            {examList.map((item, index) => (
                <div key={index} className="exam-card">

                    <div className="d-flex justify-content-between align-items-center">
                        <h5>
                            {item.examName} - {item.score || item.rank}
                        </h5>

                        <button
                            type="button"
                            onClick={() => editExam(index)}
                        >
                            ✏️
                        </button>
                    </div>
                    {editingIndex === index && (
                        <div className="exam-form-box default-form mt-4">

                            <div className="row">
                                <div className="form-group col-lg-6">
                                    <label>Exam</label>

                                    <select
                                        disabled
                                        name="examName"
                                        value={exam.examId}
                                        onChange={(e) => {
                                            const selectedId = e.target.value;
                                            const selectedText =
                                                e.target.options[e.target.selectedIndex].text;

                                            setExam((prev) => ({
                                                ...prev,
                                                examId: selectedId,
                                                examName: selectedText,
                                            }));
                                        }}
                                    >
                                        <option value="{exam.Examid}">Select Exam</option>

                                        {examListApi.map((item) => (
                                            <option key={item.key} value={item.key}>
                                                {item.value}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group col-lg-6">
                                    <label>Year</label>
                                    <select

                                        onChange={(e) =>
                                            setExam((prev) => ({
                                                ...prev,
                                                year: e.target.value,
                                            }))
                                        }
                                        className="form-select"
                                    >
                                        <option value="{exam.year}">{exam.year}</option>

                                        {Array.from(
                                            { length: 25 },
                                            (_, i) => new Date().getFullYear() - i
                                        ).map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.year && (
                                        <span className="error-text">{errors.year}</span>
                                    )}
                                </div>
                                <div className="form-group col-6">
                                    <label>Rank/Score</label>
                                    <input
                                        type="text"
                                        value={exam.score}
                                        onChange={(e) => setExam((prev) => ({
                                            ...prev,
                                            score: e.target.value,
                                        }))}
                                        placeholder="Enter Score"
                                        className="form-control"
                                        maxLength={10}
                                    />
                                    {errors.score && (
                                        <span className="error-text">{errors.score}</span>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-md btn-warning  me-3 mt-2"
                                 onClick={() => saveExam("update")}
                            >
                                Save
                            </button>

                            <button
                                type="button"
                                className="btn btn-md btn-secondary  mt-2"
                                onClick={() => setEditingIndex(null)}
                            >
                                Cancel
                            </button>

                        </div>
                    )}

                </div>
            ))}

            {/* Form */}
            {showForm && (
                <div ref={formRef} className="exam-form-box default-form">

                    <h5 className="mb-4">Competitive Exam Details</h5>

                    <div className="row">

                        <div className="form-group col-6">
                            <label>Exam   </label>
                            <select
                                className="form-select"
                                value={exam.examId}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const selectedText =
                                        e.target.options[e.target.selectedIndex].text;

                                    setExam((prev) => ({
                                        ...prev,
                                        examId: selectedId,
                                        examName: selectedText,
                                    }));
                                }}
                            >
                                <option value="">Select Exam</option>

                                {examListApi.map((item) => (
                                    <option key={item.key} value={item.key}>
                                        {item.value}
                                    </option>
                                ))}
                            </select>

                            {errors.examName && (
                                <span className="error-text">{errors.examName}</span>
                            )}
                        </div>

                        <div className="form-group col-lg-6">
                            <label>Year</label>

                            <select
                                value={exam.year}
                                onChange={(e) =>
                                    setExam((prev) => ({
                                        ...prev,
                                        year: e.target.value,
                                    }))
                                }
                                className="form-select"
                            >
                                <option value="">Select Year</option>

                                {Array.from(
                                    { length: 25 },
                                    (_, i) => new Date().getFullYear() - i
                                ).map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                            {errors.year && (
                                <span className="error-text">{errors.year}</span>
                            )}
                        </div>

                        <div className="form-group col-6">
                            <label>Rank/Score</label>
                            <input
                                type="text"
                                value={exam.score}
                                onChange={(e) => setExam((prev) => ({
                                    ...prev,
                                    score: e.target.value,
                                }))}
                                placeholder="Enter Score"
                                className="form-control"
                                maxLength={10}
                            />
                            {errors.score && (
                                <span className="error-text">{errors.score}</span>
                            )}
                        </div>
                    </div>
                    <div className="mt-3">
                        <button
                            type="button"
                            className="btn btn-md btn-primary  me-3"
                             onClick={() => saveExam("save")}
                            disabled={loading}
                        >
                            {loading ? "Saving....." : "Save"}
                        </button>
 
                        <button
                            type="button"
                            className="btn btn-md btn-secondary"
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </button>
                    </div>

                </div>
            )}
            {/* SAVE */}
            <div className="text-end mt-3">
                <button type="submit" className="theme-btn btn-style-one">
                    Next
                </button>
            </div>
        </form>
    );
};

export default CompetitiveExam;
