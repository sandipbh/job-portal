'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCategory } from "../../../features/filter/filterSlice";

const Categories = () => {
    const dispatch = useDispatch();
    const [departments, setDepartments] = useState([]);

    const category =
        useSelector((state) => state.filter.jobList.category) || "";

    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const response = await fetch("/api/public-master-list", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "department", term: "" }),
                });
                const data = await response.json();
                setDepartments(data?.data || []);
            } catch (error) {
                console.error(error);
            }
        };
        loadDepartments();
    }, []);

    const categoryHandler = (e) => {
        dispatch(addCategory(e.target.value));
    };

    return (
        <div className="filter-select-box">
            <select
                className="form-select custom-filter-select"
                value={category}
                onChange={categoryHandler}
            >
                <option value="">All Departments</option>
                {departments.map((item) => (
                    <option key={item.key} value={item.key}>
                        {item.value}
                    </option>
                ))}
            </select>

            <span className="icon flaticon-briefcase"></span>
        </div>
    );
};

export default Categories;
