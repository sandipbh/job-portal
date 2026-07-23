'use client';

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIndustry } from "../../../features/filter/candidateFilterSlice";

const Industry = () => {
    const dispatch = useDispatch();

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [industryList, setIndustryList] = useState([]);
    const [tempIndustries, setTempIndustries] = useState([]);

    const selectedIndustries =
        useSelector((state) => state.candidateFilter.industries) || [];

    useEffect(() => {
        getIndustries();
    }, []);

    const getIndustries = async () => {
        try {
            const response = await fetch("/api/list-industries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    term: "",
                }),
            });

            const data = await response.json();

            setIndustryList(data?.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    // Show first 5 in sidebar
    const defaultIndustries = industryList
        .slice(0, 5)
        .map((x) => x.value);

    const sidebarIndustries =
        selectedIndustries.length > 0
            ? [
                ...selectedIndustries,
                ...defaultIndustries.filter(
                    (x) => !selectedIndustries.includes(x)
                ),
            ].slice(0, 5)
            : defaultIndustries;

    const handleTempIndustry = (industry) => {
        if (tempIndustries.includes(industry)) {
            setTempIndustries(
                tempIndustries.filter((x) => x !== industry)
            );
        } else {
            setTempIndustries([...tempIndustries, industry]);
        }
    };

    const applyIndustries = () => {
        dispatch(setIndustry(tempIndustries));
        setShowModal(false);
    };

    const handleSidebarToggle = (industry) => {
        const updated = selectedIndustries.includes(industry)
            ? selectedIndustries.filter((x) => x !== industry)
            : [...selectedIndustries, industry];

        dispatch(setIndustry(updated));
    };

    const handleOpenModal = () => {
        setTempIndustries(selectedIndustries);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setTempIndustries(selectedIndustries);
        setShowModal(false);
    };

    return (
        <>
            <div className="industry-filter">
                {sidebarIndustries.map((industry) => (
                    <label
                        key={industry}
                        className="industry-checkbox"
                    >
                        <input
                            type="checkbox"
                            checked={selectedIndustries.includes(industry)}
                            onChange={() => handleSidebarToggle(industry)}
                        />

                        <span>{industry}</span>
                    </label>
                ))}

                <button
                    className="view-more-btn"
                    onClick={handleOpenModal}
                >
                    View More
                </button>
            </div>

            {showModal && (
                <div
                    className="industry-modal-overlay"
                    onClick={handleCloseModal}
                >
                    <div
                        className="industry-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="industry-modal-header">
                            <h4>Industry</h4>

                            <button
                                className="industry-close-btn"
                                onClick={handleCloseModal}
                            >
                                ×
                            </button>
                        </div>

                        <div className="industry-search-wrap">
                            <input
                                type="text"
                                placeholder="Search Industry"
                                className="industry-search"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />
                        </div>

                        <div className="education-grid">
                            {industryList
                                .filter((item) =>
                                    item.value
                                        ?.toLowerCase()
                                        .includes(search.toLowerCase())
                                )
                                .map((item) => (
                                    <label
                                        key={item.key}
                                        className="education-item"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={tempIndustries.includes(
                                                item.value
                                            )}
                                            onChange={() =>
                                                handleTempIndustry(item.value)
                                            }
                                        />

                                        <span>
                                            {item.value}
                                        </span>
                                    </label>
                                ))}
                        </div>

                        <div className="industry-footer">
                            <button
                                className="apply-btn"
                                onClick={applyIndustries}
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

export default Industry;