'use client'
import { useState, useRef, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { toast } from 'react-toastify';

const SkillsForm = ({ data, setData, onNext }) => {

const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const [skillOptions, setSkillOptions] = useState([]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    const filtered = skillOptions.filter(
      (skill) =>
        skill.value.toLowerCase().includes(value.toLowerCase()) &&
        !skills.some((s) => s.key === skill.key)
    );

    setSuggestions(filtered);
  };

  const selectSkill = (id, value) => {

    if (!skills.some((s) => s.key === id)) {
      setSkills([
        ...skills,
        {
          key: id,
          value: value,
        },
      ]);
    }

    setInput("");
    setSuggestions([]);
  };
  const [input, setInput] = useState("");
  const [skills, setSkills] = useState([]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const getSkills = async () => {

    console.log("Fetching skills for term:");
    try {

      const response = await fetch("/api/list-skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: '',
        }),
      });

      const data = await response.json();
      console.log("exam fetched:", JSON.stringify(data.data));

      setSkillOptions(data && data.data ? data.data : []);

    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getSkills();
  }, [0]);

  // SAVE
  const handleSubmit = (e) => {
    e.preventDefault();
    setData({
        ...data,
        skills,
      });
      onNext();
  };

   // SAVE
  const handleSave =async () => {
   
          try {

            if(skills.length>0){
                setLoading(true);

                const res = await fetch("/api/candi-skills", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                      body: JSON.stringify({ skills }),
                });

                const user = await res.json();
                //console.log("Response from /api/candi-skills :", user);

                if (!res.ok) {
                    toast.error(user.message || "Skills update failed");
                    setLoading(false);
                    return;
                }
         
               /*** set list** */
                   setData({
                    ...data,
                    skills,
                  });
    console.log('skills list ',skills)

                toast.success(user.message);
                }
            } catch (error) {
                console.error(error);
                toast.error("Save failed. Please try again.");
            } finally {
                setLoading(false);
            }
 

 
  };

  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <form className="default-form skills-summary-form" onSubmit={handleSubmit}>

      {/* HEADER */}
      <div className="form-header">
        <h4>Key Skills</h4>
        <p>Add your skills and write a short professional summary</p>
      </div>

      <div className="row">
        <div className="exam-form-box">
          {/* SKILLS */}
          <div className="form-group col-12">
            <label>Skills</label>

            {/* Selected Skills */}
            {skills.length > 0 && ( <div className="skill-tags mb-2">
            {skills.map((skill, i) => (
              <div key={skill.key} className="skill-chip">
                {skill.value}
                <MdClose onClick={() => removeSkill(i)} />
              </div>
            ))}
 </div>)}
            {/* Search Field */}
            <div className="skill-input-box" ref={dropdownRef}>
              <input
                type="text"
                placeholder="Search skills..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />

              {suggestions.length > 0 && (
                <ul className="skill-dropdown">
                  {suggestions.map((skill) => (
                    <li
                      key={skill.key}
                      onClick={() => selectSkill(skill.key,skill.value)}
                    >
                      {skill.value}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
<div className="mt-3">
                        <button
                            type="button"
                            className="btn btn-md btn-primary  me-3"
                             onClick={() => handleSave()}
                            disabled={loading}
                        >
                            {loading ? "Saving....." : "Save"}
                        </button>
        </div>
 </div>
      </div>

      {/* SAVE */}
      <div className="text-end mt-3">
        <button type="submit" className="theme-btn btn-style-one">
          Save & Continue
        </button>
      </div>

    </form>
  );
};

export default SkillsForm;