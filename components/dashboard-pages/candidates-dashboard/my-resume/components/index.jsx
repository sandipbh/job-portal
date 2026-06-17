'use client'
import { useState } from "react";
import Preview from "./Preview";
import Basic from "./Basic";
import Education from "./Education";
import WorkExperience from "./Experience";
import Skills from "./Skills";
import Internship from "./Internship";
import Project from "./Project";
import CompetitiveExam from "./CompetitiveExam";

const steps = [
  "Basic",
  "Education",
  "Competitive Exams",
  "Experience",
  "Skills",
  "Internship",
  "Projects",

  "Preview"
];

const Resume = () => {

  const [step, setStep] = useState(0);

  const [data, setData] = useState({
    basic: {},
    education: [],
    competitiveExams: [],
    experience: [],
    skills: [],

    projects: []
  });

  const next = () => setStep(prev => prev + 1);
  const prev = () => setStep(prev => prev - 1);

  return (
    <div className="resume-builder">

      {/*  Stepper */}
      <div className="resume-stepper">
        {steps.map((s, i) => (
          <div
            key={i}
            onClick={() => setStep(i)}
            className={`step ${step === i ? "active" : ""} ${step > i ? "completed" : ""
              }`}
            style={{ cursor: "pointer" }}
          >
            <div className="step-circle">
              {step > i ? "✓" : i + 1}
            </div>

            <span className="step-label">{s}</span>
          </div>
        ))}
      </div>

      {/* <h4 className="current-step">
        {steps[step]}
      </h4> */}


      {/*  Forms */}
      <div className="resume-body">

        {step === 0 && <Basic data={data} setData={setData} onNext={next} />}

        {step === 1 && (
          <Education
            data={data}
            setData={setData}
            next={next}
            prev={prev}
            onNext={next}
          />
        )}

        {step === 2 && (
          <CompetitiveExam
            data={data}
            setData={setData}
            next={next}
            prev={prev}
            onNext={next}
          />
        )}

        {step === 3 && (
          <WorkExperience
            data={data}
            setData={setData}
            next={next}
            prev={prev}
            onNext={next}
          />
        )}

        {step === 4 && (
          <Skills
            data={data}
            setData={setData}
            next={next}
            prev={prev}
            onNext={next}
          />
        )}

        {step === 5 && (
          <Internship
            data={data}
            setData={setData}
            next={next}
            prev={prev}
            onNext={next}
          />
        )}

        {step === 6 && (
          <Project
            data={data}
            setData={setData}
            next={next}
            prev={prev}
            onNext={next}
          />
        )}
        {step === 7 && (
          <Preview
            data={data}
            prev={prev}
            setStep={setStep}
          />
        )}

      </div>
    </div>
  );
};

export default Resume;