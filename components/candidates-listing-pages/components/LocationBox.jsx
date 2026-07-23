
'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addLocation } from "../../../features/filter/candidateFilterSlice";

const LocationBox = () => {
    const { location } = useSelector((state) => state.candidateFilter) || {};
    const [getLocation, setLocation] = useState(location);
    const dispath = useDispatch();

    // location handler
    const locationHandler = (e) => {
        setLocation(e.target.value);
    };

    // location dispatch
    useEffect(() => {
        dispath(addLocation(getLocation));
    }, [dispath, addLocation, getLocation]);

    return (
        <>
            <input
                type="text"
                name="listing-search"
                style={{ paddingLeft: "40px" }}
                placeholder="City"
                value={location}
                onChange={locationHandler}
            />
            <span className="icon flaticon-map-locator" style={{ left: "10px" }}></span>
        </>
    );
};

export default LocationBox;
