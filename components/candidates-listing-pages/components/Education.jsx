'use client';

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setEducation } from "../../../features/filter/candidateFilterSlice";

const educationList = [
    "Any Postgraduate",
    "Any Graduate",
    "10th Pass",
    "12th Pass",
    "ITI Certification",
    "Diploma",
    "BCA",
    "B.Sc",
    "B.Com",
    "BA - Bachelor of Arts",
    "B.Tech / B.E.",
    "BBA / BMS",
    "LLB - Bachelor of Laws",
    "MBBS",
    "MCA",
    "MBA / PGDM",
    "M.Tech",
    "M.Sc",
    "PhD"
];

const Education = () => {
    const dispatch = useDispatch();

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [tempEducation, setTempEducation] = useState([]);

    const selectedEducation =
        useSelector((state) => state.candidateFilter.education) || [];
    const filteredEducation = educationList.filter((item) =>
        item.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenModal = () => {
        setTempEducation([...selectedEducation]);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setTempEducation([...selectedEducation]);
        setShowModal(false);
    };

    const handleEducationToggle = (education) => {
        setTempEducation((prev) =>
            prev.includes(education)
                ? prev.filter((item) => item !== education)
                : [...prev, education]
        );
    };

    const handleApply = () => {
        dispatch(setEducation(tempEducation));
        setShowModal(false);
    };

    const sidebarEducation =
        selectedEducation.length > 0
            ? [
                ...selectedEducation,
                ...educationList.filter(
                    (item) => !selectedEducation.includes(item)
                ),
            ].slice(0, 5)
            : educationList.slice(0, 5);


    return (
        <>
            {/* Sidebar */}

            <div className="education-filter">
                {sidebarEducation.map((edu) => (
                    <label key={edu} className="education-checkbox">
                        <input
                            type="checkbox"
                            checked={selectedEducation.includes(edu)}
                            onChange={() => {
                                const updated = selectedEducation.includes(edu)
                                    ? selectedEducation.filter(item => item !== edu)
                                    : [...selectedEducation, edu];

                                dispatch(setEducation(updated));
                            }}
                        />
                        <span>{edu}</span>
                    </label>
                ))}

                <button
                    type="button"
                    className="view-more-btn"
                    onClick={handleOpenModal}
                >
                    View More
                </button>
            </div>

            {/* Modal */}

            {showModal && (
                <div
                    className="education-modal-overlay"
                    onClick={handleCloseModal}
                >
                    <div
                        className="education-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="education-modal-header">
                            <h4>Education</h4>

                            <button
                                className="close-btn"
                                onClick={handleCloseModal}
                            >
                                ×
                            </button>
                        </div>

                        <div className="education-search-wrap">
                            <input
                                type="text"
                                placeholder="Search Education"
                                className="education-search"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />
                        </div>

                        <div className="education-grid">
                            {filteredEducation.map((edu) => (
                                <label
                                    key={edu}
                                    className="education-item"
                                >
                                    <input
                                        type="checkbox"
                                        checked={tempEducation.includes(edu)}
                                        onChange={() =>
                                            handleEducationToggle(edu)
                                        }
                                    />

                                    <span>
                                        {edu}
                                        <small>
                                            ({Math.floor(Math.random() * 2000) + 1})
                                        </small>
                                    </span>
                                </label>
                            ))}
                        </div>

                        <div className="education-footer">
                            <button
                                className="apply-btn"
                                onClick={handleApply}
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Education;