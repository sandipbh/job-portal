
'use client'

import { useState } from "react";

const LogoCoverUploader = () => {
    const [logoImg, setLogoImg] = useState("");
    const [converImg, setCoverImg] = useState("");

    // logo image
    const logoHandler = (file) => {
        setLogoImg(file);
    };

    // cover image
    const coverHandler = (file) => {
        setCoverImg(file);
    };

    return (
        <>
            <div className="uploading-outer">
                <div className="uploadButton">

                    <input
                        className="uploadButton-input"
                        type="file"
                        name="attachments[]"
                        accept="image/*"
                        id="upload"
                        required
                        onChange={(e) => logoHandler(e.target.files[0])}
                    />
                    <label
                        className="uploadButton-button ripple-effect"
                        htmlFor="upload"
                    >
                        {logoImg !== "" ? logoImg?.name : " Company Logo"}
                    </label>
                    <span className="uploadButton-file-name"></span>
                </div>
                <div className="text">
                    Max file size: 1Mb and max resolution: 500px x 500px. File type: jpeg, jpg, png, gif, bmp
                </div>

            </div>

        </>
    );
};

export default LogoCoverUploader;
