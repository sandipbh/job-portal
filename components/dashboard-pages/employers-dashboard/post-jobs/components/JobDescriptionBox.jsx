'use client';

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
});

const MAX_LENGTH = 350;

const JobDescriptionBox = ({ data, setData, errors }) => {
    const [charCount, setCharCount] = useState(0);

    const modules = useMemo(
        () => ({
            toolbar: [
                [{ header: [1, 2, 3, 4, 5, false] }],
                ["bold", "italic", "underline"],
                [{ color: [] }, { background: [] }],
                ["blockquote", "code-block"],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ align: [] }],
                [{ size: ["small", false, "large", "huge"] }],
                ["link", "image"],
            ],
        }),
        []
    );

    const formats = [
        "header",
        "bold",
        "color",
        "background",
        "italic",
        "underline",
        "blockquote",
        "code-block",
        "list",
        "align",
        "size",
        "link",
        "image",
    ];

    const handleChange = (value) => {
        const text = value.replace(/<[^>]+>/g, "").trim();
        const length = text.length;

        if (length > MAX_LENGTH) return;

        setCharCount(length);

        // IMPORTANT
        setData({
            about: value,
        });
    };

    return (
        <div className="form-group col-lg-12">
            <ReactQuill
                theme="snow"
                value={data?.about || ""}
                onChange={handleChange}
                modules={modules}
                formats={formats}
                placeholder="Write job description..."
            />

            <div
                style={{
                    textAlign: "right",
                    fontSize: "12px",
                    marginTop: "5px",
                    color: charCount < 20 ? "red" : "green",
                }}
            >
                {charCount}/20 minimum characters
            </div>

            {errors?.jobDesc && (
                <span className="text-danger small">
                    {errors.jobDesc}
                </span>
            )}
        </div>
    );
};

export default JobDescriptionBox;