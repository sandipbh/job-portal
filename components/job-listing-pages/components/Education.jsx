'use client';

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setEducation } from "../../../features/filter/filterSlice";

const Education = () => {
    const dispatch = useDispatch();
    const [educationList, setEducationList] = useState([]);

    useEffect(() => {
        const loadEducation = async () => {
            try {
                const response = await fetch("/api/public-master-list", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "courses", term: "" }),
                });
                const data = await response.json();
                setEducationList((data?.data || []).map((x) => x.value));
            } catch (error) {
                console.error(error);
            }
        };
        loadEducation();
    }, []);

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [tempEducation, setTempEducation] = useState([]);

    const selectedEducation =
        useSelector((state) => state.filter.jobList.education) || [];

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