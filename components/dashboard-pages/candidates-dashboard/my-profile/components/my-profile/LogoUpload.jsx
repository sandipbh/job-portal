'use client'
import { useState } from "react";
import Cropper from "react-easy-crop";
import {
    FaEnvelope,
    FaPhone,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaPen,
    FaCheckCircle
} from "react-icons/fa";

const LogoUpload = ({ formData, setFormData, goBack }) => {

    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [imageError, setImageError] = useState("");
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);

    const handleImage = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            //"image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setImageError(
                "Only JPG, JPEG, PNG  images are allowed"
            );
            e.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setImageError(
                "Image size must be less than 2MB"
            );
            e.target.value = "";
            return;
        }

        setImageError("");

        const imageUrl = URL.createObjectURL(file);

        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setImageSrc(imageUrl);
    };

   const handleSave = async () => {
  if (!croppedAreaPixels || !imageSrc) return;

  const croppedImageFile = await getCroppedImage(
    imageSrc,
    croppedAreaPixels
  );

  if (!croppedImageFile) {
    setImageError("Failed to crop image. Please try again.");
    return;
  }

  // Create Base64 preview instead of Blob URL
  const reader = new FileReader();

  reader.onloadend = async () => {
    setFormData((prev) => ({
      ...prev,
      photo: reader.result,
      photoFile: croppedImageFile,
    }));

     
     setImageSrc(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  reader.readAsDataURL(croppedImageFile);
};
    const getCroppedImage = async (
        imageSrc,
        croppedAreaPixels
    ) => {
        const image = new Image();

        image.crossOrigin = "anonymous";
        image.src = imageSrc;

        await new Promise((resolve) => {
            image.onload = resolve;
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
            image,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
        );

        // ctx.globalCompositeOperation =
        //     "destination-in";

        // ctx.beginPath();
        // ctx.arc(
        //     canvas.width / 2,
        //     canvas.height / 2,
        //     canvas.width / 2,
        //     0,
        //     Math.PI * 2
        // );
        // ctx.closePath();
        // ctx.fill();

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    resolve(null);
                    return;
                }
                const file = new File([blob], "profile.png", {
                    type: "image/png",
                });
                resolve(file);
            }, "image/png");
        });
    };

    return (
        <div className="profile-page">

            {/* 🔹 TOP */}
            <div className="profile-top">

                {/* IMAGE */}
                {/* IMAGE */}
                <div className="profile-img-wrapper">

                    <img
                    src={
                        formData.photo
                        ? formData.photo
                        : "/default-user.png"
                    }
                    alt="Profile"
                    className="profile-image"
                    />

                    <label className="upload-btn">
                        +
                        <input
                            type="file"
                            hidden
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={handleImage}
                        />
                    </label>

                    {imageError && (
                        <span className="error-text">
                            {imageError}
                        </span>
                    )}
                </div>

                {/* CENTER */}
                <div className="profile-center">

                    <div className="name-row">
                        <h1>{formData.fullName || "Your Name"}</h1>
                        <FaPen className="edit-icon" onClick={goBack} />
                    </div>

                    {/* DEGREE */}
                    <span className="badge">
                        {formData.highestQualification || "-"}
                    </span>

                    {/* META ROW */}
                    <div className="meta">
                        <span>📍 {formData.city || "-"}</span>
                        <span>👤 {formData.gender || "Male"}</span>
                        <span>📅 {formData.dob || "-"}</span>
                    </div>

                </div>

            </div>

            {/* 🔹 DETAILS */}
            <div className="details-card">

                {/* EMAIL */}
                <div className="row">
                    <div className="left">
                        <div className="icon"><FaEnvelope /></div>
                        <span>Email Address</span>
                    </div>

                    <div className="divider" />

                    <div className="right">
                        {formData.email || "-"}
                        {formData.email && <FaCheckCircle className="tick" />}
                    </div>
                </div>

                {/* PHONE */}
                <div className="row">
                    <div className="left">
                        <div className="icon"><FaPhone /></div>
                        <span>Mobile Number</span>
                    </div>

                    <div className="divider" />

                    <div className="right">
                        {formData.phone || "-"}
                        {formData.phone && <FaCheckCircle className="tick" />}
                    </div>
                </div>

                {/* DOB */}
                <div className="row">
                    <div className="left">
                        <div className="icon"><FaCalendarAlt /></div>
                        <span>Date of Birth</span>
                    </div>

                    <div className="divider" />

                    <div className="right">
                        {formData.dob || "-"}
                    </div>
                </div>

                {/* ADDRESS */}
                <div className="row">
                    <div className="left">
                        <div className="icon"><FaMapMarkerAlt /></div>
                        <span>Complete Address</span>
                    </div>

                    <div className="divider" />

                    <div className="right">
                        {formData.address || "-"}
                    </div>
                </div>

            </div>

            {/* 🔹 CROP */}
            {imageSrc && (
                <div className="crop-modal">
                    <div className="crop-container">

                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            //cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={(
                                _,
                                croppedAreaPixels
                            ) =>
                                setCroppedAreaPixels(
                                    croppedAreaPixels
                                )
                            }
                        />

                        <div className="crop-actions">

                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) =>
                                    setZoom(
                                        Number(e.target.value)
                                    )
                                }
                            />

                            <div className="buttons">

                                <button
                                    className="cancel-btn"
                                    type="button"
                                    onClick={() => {
                                        if (imageSrc) {
                                           // URL.revokeObjectURL(imageSrc);
                                        }

                                        setImageSrc(null);
                                        setZoom(1);
                                        setCrop({ x: 0, y: 0 });
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="save-btn"
                                    type="button"
                                    onClick={handleSave}
                                >
                                    Save
                                </button>

                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default LogoUpload;