'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    addSkill,
    setSkills,
} from "../../../features/filter/filterSlice";

const Skills = () => {
    const dispatch = useDispatch();
    const [skillsList, setSkillsList] = useState([]);

    useEffect(() => {
        const loadSkills = async () => {
            try {
                const response = await fetch("/api/public-master-list", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "skills", term: "" }),
                });
                const data = await response.json();
                setSkillsList((data?.data || []).map((x) => x.value));
            } catch (error) {
                console.error(error);
            }
        };
        loadSkills();
    }, []);

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");

    const selectedSkills =
        useSelector((state) => state.filter.jobList.skills) || [];

    const filteredSkills = skillsList.filter((skill) =>
        skill.toLowerCase().includes(search.toLowerCase())
    );

    const [tempSkills, setTempSkills] = useState([]);
    const handleOpenModal = () => {
        setTempSkills([...selectedSkills]);
        setShowModal(true);
    };
    const handleSkillToggle = (skill) => {
        setTempSkills((prev) =>
            prev.includes(skill)
                ? prev.filter((item) => item !== skill)
                : [...prev, skill]
        );
    };

    const handleApply = () => {
        dispatch(setSkills(tempSkills));
        setShowModal(false);
    };

    const handleCloseModal = () => {
        setTempSkills([...selectedSkills]);
        setShowModal(false);
    };

    const sidebarSkills =
        selectedSkills.length > 0
            ? [
                ...selectedSkills,
                ...skillsList.filter(
                    (skill) => !selectedSkills.includes(skill)
                ),
            ].slice(0, 5)
            : skillsList.slice(0, 5);

    const handleSidebarSkillToggle = (skill) => {
        const updated = selectedSkills.includes(skill)
            ? selectedSkills.filter((item) => item !== skill)
            : [...selectedSkills, skill];

        dispatch(setSkills(updated));
    };
    return (
        <>
            {/* Sidebar */}

            <div className="skills-filter">
                {sidebarSkills.map((skill) => (
                    <label key={skill} className="skills-checkbox">
                        <input
                            type="checkbox"
                            checked={selectedSkills.includes(skill)}
                            onChange={() => handleSidebarSkillToggle(skill)}
                        />
                        <span>{skill}</span>
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
                    className="skills-modal-overlay"
                    onClick={handleCloseModal}
                >
                    <div
                        className="skills-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="skills-modal-header">
                            <h4>Skills</h4>

                            <button
                                className="close-btn"
                                onClick={handleCloseModal}
                            >
                                ×
                            </button>
                        </div>

                        <div className="skills-search-wrap">
                            <input
                                type="text"
                                placeholder="Search Skills"
                                className="skills-search"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />
                        </div>

                        <div className="skills-grid">
                            {filteredSkills.map((skill) => (
                                <label
                                    key={skill}
                                    className="skills-item"
                                >
                                    <input
                                        type="checkbox"
                                        checked={tempSkills.includes(skill)}
                                        onChange={() => handleSkillToggle(skill)}
                                    />

                                    <span>
                                        {skill}
                                    </span>
                                </label>
                            ))}
                        </div>

                        <div className="skills-footer">
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

export default Skills;