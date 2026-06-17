'use client'
import { useState } from "react";
import { MdClose } from "react-icons/md";

const SkillsForm = ({ data, setData, onNext }) => {

    const [input, setInput] = useState("");
    const [skills, setSkills] = useState(data.skills || []);
    // const [summary, setSummary] = useState(data.summary || "");

    // ADD SKILL
    const addSkill = () => {
        const value = input.trim();
        if (!value) return;

        if (!skills.includes(value)) {
            setSkills([...skills, value]);
        }

        setInput("");
    };

    const removeSkill = (index) => {
        setSkills(skills.filter((_, i) => i !== index));
    };

    // ENTER KEY ADD
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addSkill();
        }
    };

    // SAVE
    const handleSubmit = (e) => {
        e.preventDefault();

        setData({
            ...data,
            skills,
            // summary
        });

        onNext();
    };
    //   const generateSummary = () => {
    //     const name = data?.basic?.fullName || "A professional";
    //     const skillsText = skills?.length
    //       ? skills.join(", ")
    //       : "various technologies";

    //     const generated = `${name} is a dedicated and results-driven professional with strong expertise in ${skillsText}. 
    // Known for strong problem-solving abilities and adaptability, they have consistently delivered high-quality results in dynamic environments.
    // They are seeking opportunities to contribute their skills, grow professionally, and make a meaningful impact within an organization.`;

    //     setSummary(generated);
    //   };

    return (
        <form className="default-form skills-summary-form" onSubmit={handleSubmit}>

            {/* HEADER */}
            <div className="form-header">
                <h4>Key Skills</h4>
                <p>Add your skills and write a short professional summary</p>
            </div>

            <div className="row">

                {/* SKILLS */}
                <div className="form-group col-12">
                    <label>Skills</label>

                    <div className="skill-input-box">
                        <input
                            type="text"
                            placeholder="e.g. React, Node.js, Java"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />

                        <button
                            type="button"
                            className="add-btn"
                            onClick={addSkill}
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* SKILL TAGS */}
                <div className="col-12">
                    <div className="skill-tags">
                        {skills.map((skill, i) => (
                            <div key={i} className="skill-chip">
                                {skill}
                                <MdClose onClick={() => removeSkill(i)} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* SUMMARY */}
                {/* <div className="form-group col-12 mt-3">
          <label>Resume Summary</label>

          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="e.g. Passionate developer with experience in..."
            className="summary-textarea"
          />

          <div className="summary-footer">
            <small className="hint-text">
              Keep it short (3–5 lines) and impactful
            </small>

            <button
              type="button"
              className="ai-btn"
              onClick={generateSummary}
            >
              ✨ Generate with AI
            </button>
          </div>
        </div> */}
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