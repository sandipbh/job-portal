
'use client'
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCategory } from "../../../features/filter/candidateFilterSlice";

const Categories = () => {
    const getCategory =
        useSelector((state) => state.candidateFilter.category) || "";
    const [category, setCategory] = useState([]);

    const dispatch = useDispatch();

    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const response = await fetch("/api/list-department", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ term: "", pageNo: 1 }),
                });
                const data = await response.json();
                setCategory(data?.data || []);
            } catch (error) {
                console.error(error);
            }
        };
        loadDepartments();
    }, []);

    // category handler
    const categoryHandler = (e) => {
        dispatch(addCategory(e.target.value));
    };

    return (
        <>
            <select
                onChange={categoryHandler}
                value={getCategory}
                className="form-select"
            >
                <option value="">Choose a category</option>
                {category?.map((item) => (
                    <option key={item.key} value={item.value}>
                        {item.value}
                    </option>
                ))}
            </select>
            <span className="icon flaticon-briefcase"></span>
        </>
    );
};

export default Categories;
