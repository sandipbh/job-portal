'use client';

import { useState } from "react";

const SocialNetworkBox = ({ onNext }) => {
  const [showForm, setShowForm] = useState(false);

  const [data, setData] = useState({
    facebook: "",
    twitter: "",
    linkedin: "",
    google: "",
  });


  const [error, setError] = useState("");

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setError(""); // ✅ remove error on typing
  };

  // ✅ Next Button Handler with validation
  const handleNext = () => {
    if (showForm) {
      const hasAtLeastOne = Object.values(data).some(
        (val) => val.trim() !== ""
      );

      if (!hasAtLeastOne) {
        setError("Please add at least one social media link");
        return;
      }
    }

    onNext(); // move to next tab
  };

  return (
    <div className="social-box">

      {/* Radio Buttons */}
      <div className="form-group">
        <label>Do you want to add Social Media links?</label>

        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="social"
              value="yes"
              onChange={() => {
                setShowForm(true);
                setError("");
              }}
            />
            Yes
          </label>

          <label>
            <input
              type="radio"
              name="social"
              value="no"
              defaultChecked
              onChange={() => {
                setShowForm(false);
                setError("");
              }}
            />
            No
          </label>
        </div>
      </div>

      {/* If YES → show form */}
      {showForm && (
        <form className="default-form mt-3">
          <div className="row">

            <div className="form-group col-lg-6">
              <label>Facebook</label>
              <input
                type="text"
                name="facebook"
                value={data.facebook}
                onChange={handleChange}
                placeholder="www.facebook.com/yourpage"
              />
            </div>

            <div className="form-group col-lg-6">
              <label>Twitter</label>
              <input
                type="text"
                name="twitter"
                value={data.twitter}
                onChange={handleChange}
                placeholder="www.twitter.com/yourhandle"
              />
            </div>

            <div className="form-group col-lg-6">
              <label>LinkedIn</label>
              <input
                type="text"
                name="linkedin"
                value={data.linkedin}
                onChange={handleChange}
                placeholder="www.linkedin.com/company"
              />
            </div>

            <div className="form-group col-lg-6">
              <label>Google</label>
              <input
                type="text"
                name="google"
                value={data.google}
                onChange={handleChange}
                placeholder="Business profile link"
              />
            </div>

          </div>
        </form>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-danger small mt-2">{error}</div>
      )}

      {/* Next Button */}
      <div className="form-group col-lg-12 d-flex justify-content-end mt-3">
        <button
          type="button"
          className="theme-btn btn-style-one"
          onClick={handleNext}
        >
          Next
        </button>
      </div>

    </div>
  );
};

export default SocialNetworkBox;