'use client';

import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Preview = ({ data }) => {

  const resumeRef = useRef(null);

  const downloadPDF = async () => {
    const element = resumeRef.current;

    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 210;
    const pdfHeight =
      (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      pdfWidth,
      pdfHeight
    );

    pdf.save("resume.pdf");

  };

  return (

    <>


      <div ref={resumeRef} className="resume-preview-container">

        {/* HEADER */}
        <div className="resume-preview-header">
          <h1>{data.basic?.fullName}</h1>
        </div>

        <div className="resume-preview-body">

          {/* LEFT COLUMN */}
          <div className="resume-left-column">

            {/* CONTACT */}
            <section>
              <h3>GET IN TOUCH!</h3>

              <ul className="resume-list">
                <li>Mobile: {data.basic?.phone}</li>
                <li>Email: {data.basic?.email}</li>
              </ul>
            </section>

            {/* PERSONAL DETAILS */}
            <section>
              <h3>PERSONAL DETAILS</h3>

              <ul className="resume-list">
                <li>State: {data.basic?.state}</li>
                <li>City: {data.basic?.city}</li>
                <li>Date of Birth: {data.basic?.dob}</li>
                <li>Gender: {data.basic?.gender}</li>
              </ul>
            </section>

            {/* SKILLS */}
            <section>
              <h3>SKILLS</h3>

              <ul className="resume-list">
                {data.skills?.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            </section>

            {/* TEST RANKS */}
            <section>
              <h3>TEST RANKS</h3>

              <ul className="resume-list">
                {data.competitiveExams?.map((exam, i) => (
                  <li key={i}>
                    {exam.examName} : {exam.score}
                  </li>
                ))}
              </ul>
            </section>

          </div>

          {/* RIGHT COLUMN */}
          <div className="resume-right-column">

            {/* EDUCATION */}
            <section>
              <h3>EDUCATION</h3>

              {data.education?.postGraduation && (
                <div className="resume-item">
                  <strong>Post Graduation</strong>
                  <div className="edu-row">
                    <span className="label">Course</span>
                    <span className="value">{data.education.postGraduation.course}</span>
                  </div>

                  <div className="edu-row">
                    <span className="label">University</span>
                    <span className="value"> {data.education.postGraduation.university}</span>
                  </div>

                  <div className="edu-row">
                    <span className="label">Score</span>
                    <span className="value">{data.education.postGraduation.score}%</span>
                  </div>

                </div>
              )}

              {data.education?.graduation && (
                <div className="resume-item">
                  <strong>Graduation</strong>
                  <div className="edu-row">
                    <span className="label">Course</span>
                    <span className="value">{data.education.graduation.course}</span>
                  </div>

                  <div className="edu-row">
                    <span className="label">University</span>
                    <span className="value">{data.education.graduation.university}</span>
                  </div>

                  <div className="edu-row">
                    <span className="label">Score</span>
                    <span className="value">{data.education.graduation.score}%</span>
                  </div>
                </div>
              )}

              {data.education?.twelfth && (
                <div className="resume-item">
                  <strong>Class XII</strong>

                  <div className="edu-row">
                    <span className="label">Board</span>
                    <span className="value">{data.education.twelfth.board}</span>
                  </div>

                  <div className="edu-row">
                    <span className="label">Stream</span>
                    <span className="value">{data.education.twelfth.stream}</span>
                  </div>

                  <div className="edu-row">
                    <span className="label">Year</span>
                    <span className="value">{data.education.twelfth.passingYear}</span>
                  </div>

                  <div className="edu-row">
                    <span className="label">Percentage</span>
                    <span className="value">{data.education.twelfth.marks}%</span>
                  </div>
                </div>
              )}

              {data.education?.tenth && (
                <div className="resume-item">
                  <strong>Class X</strong>
                  <div className="edu-row">
                    <span className="label">Board</span>
                    <span className="value"> {data.education.tenth.board}</span>
                  </div>

                  <div className="edu-row">
                    <span className="label">Medium</span>
                    <span className="value">{data.education.tenth.medium}</span>
                  </div>

                  <div className="edu-row">
                    <span className="label">Year</span>
                    <span className="value">{data.education.tenth.passingYear}</span>
                  </div>

                  <div className="edu-row">
                    <span className="label">Percentage</span>
                    <span className="value">{data.education.tenth.marks}%</span>
                  </div>

                </div>
              )}
            </section>

            {/* WORK EXPERIENCE */}
            <section>
              <h3>WORK EXPERIENCE</h3>

              {data.experience?.map((exp, i) => (
                <div key={i} className="resume-item">

                  <strong>{exp.company}</strong>

                  <div className="resume-subtitle">
                    {exp.designation}
                  </div>

                  <div className="resume-date">
                    {exp.workingStartMonth} {exp.workingStartYear}
                    {" - "}
                    {exp.currentlyWorking
                      ? "Present"
                      : `${exp.workingEndMonth || ""} ${exp.workingEndYear || ""}`}
                  </div>

                  {exp.description && (
                    <p>{exp.description}</p>
                  )}
                </div>
              ))}
            </section>

            {/* PROJECTS */}
            <section>
              <h3>PROJECTS</h3>

              {data.projects?.map((proj, i) => (
                <div key={i} className="resume-item">

                  <strong>{proj.projectName}</strong>

                  <div className="resume-date">
                    {proj.projectStartMonth} {proj.projectStartYear}
                    {" - "}
                    {proj.currentlyWorking
                      ? "Present"
                      : `${proj.projectEndMonth || ""} ${proj.projectEndYear || ""}`}
                  </div>

                  {proj.description && (
                    <p>{proj.description}</p>
                  )}

                  {proj.skills?.length > 0 && (
                    <p>
                      <strong>Tech Stack:</strong>{" "}
                      {proj.skills.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </section>

            {/* INTERNSHIPS */}
            {data.internships?.length > 0 && (
              <section>
                <h3>INTERNSHIPS</h3>

                {data.internships.map((item, i) => (
                  <div key={i} className="resume-item">

                    <strong>{item.company}</strong>

                    <div className="resume-subtitle">
                      {item.profile}
                    </div>

                    <div className="resume-date">
                      {item.startMonth} {item.startYear}
                      {" - "}
                      {item.currentlyWorking
                        ? "Present"
                        : `${item.endMonth || ""} ${item.endYear || ""}`}
                    </div>

                    <div className="resume-subtitle">
                      {item.description}
                    </div>

                  </div>
                ))}
              </section>
            )}

          </div>
        </div>

      </div>
      <div className="row mt-3 ">
        <div className="col text-center">
          <button onClick={downloadPDF} className="btn btn-info btn-md w-25 ">
            Download PDF
          </button></div>
      </div>
    </>
  );
};

export default Preview;