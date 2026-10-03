
'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addLocation, addLocationKey } from "../../../features/filter/filterSlice";

const LocationBox = () => {
    const { jobList } = useSelector((state) => state.filter);
    const [getLocation, setLocation] = useState(jobList.location);
    const [locationList, setLocationList] = useState([]);
    const [showLocationList, setShowLocationList] = useState(false);
    const dispath = useDispatch();

    // location handler
    const locationHandler = (e) => {
        setLocation(e.target.value);
        setShowLocationList(true);
    };

    useEffect(() => {
        setLocation(jobList.location);
    }, [jobList.location]);

    useEffect(() => {
        if (!getLocation) {
            setLocationList([]);
            return;
        }

        const controller = new AbortController();
        const debounce = setTimeout(async () => {
            try {
                const response = await fetch("/api/public-location-search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ term: getLocation }),
                    signal: controller.signal,
                });
                const result = await response.json();
                setLocationList(Array.isArray(result?.data) ? result.data : []);
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error(error);
                    setLocationList([]);
                }
            }
        }, 300);

        return () => {
            clearTimeout(debounce);
            controller.abort();
        };
    }, [getLocation]);

    return (
        <>
            <input
                type="text"
                name="listing-search"
                placeholder="e.g. Delhi"
                value={getLocation}
                onChange={locationHandler}
                autoComplete="off"
                onFocus={() => setShowLocationList(true)}
                onBlur={() => setTimeout(() => {
                    setShowLocationList(false);
                    setLocation(jobList.location);
                }, 200)}
            />
            {showLocationList && locationList.length > 0 && (
                <ul className="ui-autocomplete">
                    {locationList.map((item, index) => (
                        <li
                            key={`${item.key ?? "location"}-${index}`}
                            onPointerDown={(event) => {
                                event.preventDefault();
                                if (item?.key == null || !item?.value) return;
                                setLocation(item.value);
                                dispath(addLocation(item.value));
                                dispath(addLocationKey(String(item.key)));
                                setLocationList([]);
                                setShowLocationList(false);
                            }}
                        >
                            {item.value}
                        </li>
                    ))}
                </ul>
            )}
            <span className="icon flaticon-map-locator"></span>
        </>
    );
};

export default LocationBox;
