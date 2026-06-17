'use client';

import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import "react-quill-new/dist/quill.snow.css";

// 🔥 Disable SSR
const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
});

const MAX_LENGTH = 250;

const AboutEditor = ({ data, setData, errors }) => {
    const [charCount, setCharCount] = useState(0);

    // ✅ Toolbar config
    const modules = useMemo(() => ({
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
    }), []);

    // ✅ Formats (fixed - no "bullet")
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

    // ✅ Handle typing + limit
    const handleChange = (value) => {
        const text = value.replace(/<[^>]+>/g, ""); // remove HTML
        const length = text.length;

        if (length > MAX_LENGTH) return; // 🚫 block extra input

        setCharCount(length);

        setData((prev) => ({
            ...prev,
            about: value,
        }));
    };

    // ✅ Fix counter on reload / existing data
    useEffect(() => {
        const text = (data.about || "").replace(/<[^>]+>/g, "");
        setCharCount(text.length);
    }, [data.about]);

    return (
        <div className="max-w-[1000px] mx-auto mt-10">
            <div className="form-group col-lg-12">

                <ReactQuill
                    theme="snow"
                    value={data.about || ""}
                    onChange={handleChange}   // ✅ FIXED
                    modules={modules}
                    formats={formats}
                    placeholder="Write about your company..."
                />

                {/* 🔥 Character Counter */}
                <div
                    style={{
                        textAlign: "right",
                        fontSize: "12px",
                        marginTop: "5px",
                        color: charCount > 220 ? "red" : "#666",
                    }}
                >
                    {charCount}/{MAX_LENGTH}
                </div>

                {errors?.about && (
                    <span className="text-danger small error">
                        {errors.about}
                    </span>
                )}
            </div>
        </div>
    );
};

export default AboutEditor;