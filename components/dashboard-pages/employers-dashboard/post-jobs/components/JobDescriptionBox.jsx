'use client';

import dynamic from "next/dynamic";
import { useMemo, useState, useRef } from "react";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";

const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
});

const MAX_LENGTH = 500;


const JobDescriptionBox = ({ data, setData, errors }) => {


    const [charCount, setCharCount] = useState(0);
    const quillRef = useRef(null);
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

    const validateInput = (value) => {
        const regex = /^[a-zA-Z0-9\s.,!?()]*$/;
        return regex.test(value);
    };

    const handleChange = (content, delta, source, editor) => {
        const text = editor.getText().trim();

        if (text.length > MAX_LENGTH + 1) { const quill = quillRef.current.getEditor(); quill.deleteText(MAX_LENGTH, text.length); return; }
        setCharCount(text.length);

        if (validateInput(text)) {
            setData({
                about: content, // Save HTML
            });
        }
    };

    return (
        <div className="form-group col-lg-12">
            <ReactQuill
                ref={quillRef}
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
                    color: charCount < 500 ? "red" : "green",
                }}
            >
                {charCount}/500 minimum characters
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