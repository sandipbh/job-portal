'use client'

import { useDispatch, useSelector } from "react-redux";
import { addCompanyType } from "../../../features/filter/filterSlice";
import { CompanyTypeCheck } from "../../../features/job/jobSlice";

const CompanyType = () => {
    const { companyTypeList } = useSelector(
        (state) => state.job
    ) || {};

    const dispatch = useDispatch();

    const companyTypeHandler = (e, id) => {
        dispatch(addCompanyType(e.target.value));
        dispatch(CompanyTypeCheck(id));
    };

    return (
        <ul className="switchbox">
            {companyTypeList?.map((item) => (
                <li key={item.id}>
                    <label className="switch">
                        <input
                            type="checkbox"
                            value={item.value}
                            checked={item.isChecked || false}
                            onChange={(e) =>
                                companyTypeHandler(e, item.id)
                            }
                        />
                        <span className="slider round"></span>
                        <span className="title">
                            {item.name}
                        </span>
                    </label>
                </li>
            ))}
        </ul>
    );
};

export default CompanyType;