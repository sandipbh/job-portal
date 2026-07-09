'use client'

import { useDispatch, useSelector } from "react-redux";
import { addExperience } from "../../../features/filter/candidateFilterSlice";;

const ExperienceLevel = () => {
    const dispatch = useDispatch();

    const experience =
        useSelector((state) => state.filter.jobList.experience) || 0;

    const handleChange = (e) => {
        dispatch(addExperience(Number(e.target.value)));
    };

    return (
        <div className="experience-filter">
            <div
                className="experience-marker"
                style={{
                    left: `calc(${(experience / 30) * 100}% - 12px)`,
                }}
            >
                <span>{experience}</span>
            </div>

            <input
                type="range"
                min="0"
                max="30"
                value={experience}
                onChange={handleChange}
                className="experience-slider"
                style={{
                    background: `linear-gradient(
            to right,
            #1967d2 0%,
            #1967d2 ${(experience / 30) * 100}%,
            #d7dce8 ${(experience / 30) * 100}%,
            #d7dce8 100%
        )`
                }}
            />

            <div className="experience-labels">
                <span>0 Yrs</span>
                <span>30 Yrs</span>
            </div>
        </div>
    );
};

export default ExperienceLevel;