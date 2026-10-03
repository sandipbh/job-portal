'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIndustry } from "../../../features/filter/filterSlice";

const Industry = () => {
    const dispatch = useDispatch();

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [industryList, setIndustryList] = useState([]);

    useEffect(() => {
        const loadIndustries = async () => {
            try {
                const response = await fetch("/api/public-master-list", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "industries", term: "" }),
                });
                const data = await response.json();
                setIndustryList((data?.data || []).map((x) => x.value));
            } catch (error) {
                console.error(error);
            }
        };
        loadIndustries();
    }, []);

    const selectedIndustries =
        useSelector(
            (state) => state.filter.jobList.industry
        ) || [];

    const [tempIndustries, setTempIndustries] = useState([]);

    const defaultIndustries = industryList.slice(0, 5);

    const sidebarIndustries =
        selectedIndustries.length > 0
            ? [
                ...selectedIndustries,
                ...defaultIndustries.filter(
                    (item) => !selectedIndustries.includes(item)
                ),
            ].slice(0, 5)
            : defaultIndustries.slice(0, 5);
    const handleTempIndustry = (industry) => {
        if (tempIndustries.includes(industry)) {
            setTempIndustries(
                tempIndustries.filter(
                    (item) => item !== industry
                )
            );
        } else {
            setTempIndustries([
                ...tempIndustries,
                industry,
            ]);
        }
    };

    const applyIndustries = () => {
        dispatch(setIndustry(tempIndustries));
        setShowModal(false);
    };

    const handleSidebarToggle = (industry) => {
        const updated = selectedIndustries.includes(industry)
            ? selectedIndustries.filter((item) => item !== industry)
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
                            onChange={() =>
                                handleSidebarToggle(industry)
                            }
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
                        onClick={(e) =>
                            e.stopPropagation()
                        }
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
                                    item
                                        .toLowerCase()
                                        .includes(search.toLowerCase())
                                )
                                .map((item) => (
                                    <label
                                        key={item}
                                        className="education-item"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={tempIndustries.includes(item)}
                                            onChange={() =>
                                                handleTempIndustry(item)
                                            }
                                        />

                                        <span>{item}</span>
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