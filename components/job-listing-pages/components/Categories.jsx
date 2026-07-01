'use client'

import { useDispatch, useSelector } from "react-redux";
import { addCategory } from "../../../features/filter/filterSlice";

const Categories = () => {
    const dispatch = useDispatch();

    const category =
        useSelector((state) => state.filter.jobList.category) || "";

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

                <option value="software-development">
                    Software Development
                </option>

                <option value="data-science">
                    Data Science & Analytics
                </option>

                <option value="it-security">
                    IT & Information Security
                </option>

                <option value="product-management">
                    Product Management
                </option>

                <option value="ui-ux-design">
                    UI / UX Design
                </option>

                <option value="devops-cloud">
                    DevOps & Cloud
                </option>

                <option value="qa-testing">
                    QA & Testing
                </option>

                <option value="finance-accounting">
                    Finance & Accounting
                </option>

                <option value="sales-business-development">
                    Sales & Business Development
                </option>

                <option value="marketing">
                    Marketing & Digital Marketing
                </option>

                <option value="human-resources">
                    Human Resources
                </option>

                <option value="customer-support">
                    Customer Support
                </option>

                <option value="operations">
                    Operations & Supply Chain
                </option>

                <option value="manufacturing">
                    Manufacturing & Production
                </option>

                <option value="healthcare">
                    Healthcare & Medical
                </option>

                <option value="education">
                    Education & Training
                </option>

                <option value="legal">
                    Legal & Compliance
                </option>

                <option value="others">
                    Others
                </option>
            </select>

            <span className="icon flaticon-briefcase"></span>
        </div>
    );
};

export default Categories;