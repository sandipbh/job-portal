'use client';

import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Preview = ({ data }) => {

  const resumeRef = useRef(null);

  const [personal, setPersonal] = useState({});
  const [education, setEducation] = useState([]);
  const [exams, setExams] = useState([]);
  const [experience, setExperience] = useState([]);
  const [skills, setSkills] = useState([]);
  const [internship, setInternship] = useState([]);
  const [project, setProject] = useState([]);


  const [tenthData, setTenthData] = useState({});
  const [twelfthData, setTwelfthData] = useState({});
  const [graduateData, setGraduateData] = useState({});
  const [mastersData, setMastersData] = useState({});
  const [PhDData, setPhDData] = useState({});





  useEffect(() => {
    getExperienceDetails();
  }, []);

  const getSkillList = (skillsIds, skills) => {
    const keys = skillsIds.split("^");
    const values = skills.split("^");

    const skillsLearn = keys.map((k, index) => ({
      key: Number(k),
      value: values[index]
    }));
    return skillsLearn;
  }
  const getExperienceDetails = async () => {
    try {
      const response = await fetch("/api/candi-resume-details", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const result = await response.json();

      const data = result?.data;
      console.log('data ', data)

      if (data) {

        setPersonal(data.personal);

        setEducation(data.education);
        if (data.education) {

          setTenthData(data.education.filter(x => x.education === "10th")[0]);
          setTwelfthData(data.education.filter(x => x.education === "12th")[0]);
          setGraduateData(data.education.filter(x => x.education === "Graduate")[0]);
          setMastersData(data.education.filter(x => x.education === "Masters")[0]);
          setPhDData(data.education.filter(x => x.education === "PhD")[0]);

        }

        setExams(data.exams);
        setExperience(data.experience);

        const skillsList = data.skills.map(item => ({
          key: item.skillId,
          value: item.skillName,
        }));
        setSkills(skillsList);


        setInternship(data.internship);
        console.log('data.internship', data.internship)
        setProject(data.project);



      }
    } catch (error) {
      console.error(error);
    }
  };

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
          <h1>{personal?.fullName}</h1>
        </div>

        <div className="resume-preview-body">

          {/* LEFT COLUMN */}
          <div className="resume-left-column">

            {/* CONTACT */}
            <section>
              <h3>GET IN TOUCH!</h3>

              <ul className="resume-list">
                <li>Mobile: {personal?.mobile}</li>
                <li>Email: {personal?.email}</li>
              </ul>
            </section>

            {/* PERSONAL DETAILS */}
            <section>
              <h3>PERSONAL DETAILS</h3>

              <ul className="resume-list">
                <li>State: {personal?.state}</li>
                <li>City: {personal?.city}</li>
                <li>Date of Birth: {personal?.dob}</li>
                <li>Gender: {personal?.gender}</li>
              </ul>
            </section>
            {/* SALARY */}
            <section>
              <h3>SALARY   </h3>
              <ul className="resume-list">
                <li> Current CTC :  {personal?.currentSalary}</li>
                <li> Expected CTC :  {personal?.expectedSalary}</li>
              </ul>
            </section>
            {/* SKILLS */}
            <section>
              <h3>SKILLS   </h3>
              <ul className="resume-list">
                {skills?.map((skills, i) => (
                  <li key={i}>{skills.value}</li>
                ))}
              </ul>
            </section>

            {/* TEST RANKS */}
            <section>
              <h3>TEST RANKS  </h3>

              <ul className="resume-list">
                {exams?.map((exam, i) => (
                  <li key={i}>
                    {exam.examName} :  {exam.score}
                  </li>
                ))}
              </ul>
            </section>

          </div>

          {/* RIGHT COLUMN */}
          <div className="resume-right-column">

            {/* EDUCATION */}
            <section>
              <h3>EDUCATION   </h3>

              {PhDData?.university && (
                <div className="resume-item">
                  <strong>PhD</strong>
                  <div className="edu-row">
                    <span className="label">University</span>
                    <span className="value"> {PhDData?.university}</span>
                  </div>
                  <div className="edu-row">
                    <span className="label">Course</span>
                    <span className="value">{PhDData?.course}</span>
                  </div>

                  <div className="edu-row">
                    <span className="label">Specialization</span>
                    <span className="value">{PhDData?.specialization}</span>
                  </div>

                  <div className="edu-row">
                    <span className="label">Score</span>
                    <span className="value">{PhDData?.marks} </span>
                  </div>

                </div>
              )}

              {mastersData?.university && (
                <div className="resume-item">
                  <strong>Post Graduation</strong>
                  <div className="edu-row">
                    <span className="label">University</span>
                    <span className="value"> {mastersData?.university}</span>
                  </div>
                  <div className="edu-row">
                    <span className="label">Course</span>
                    <span className="value">{mastersData?.course}</span>
                  </div>

                  <div className="edu-row">
                    <span className="label">Specialization</span>
                    <span className="value">{mastersData?.specialization}</span>
                  </div>
                  <div className="edu-row">
                    <span className="label">Passing Year</span>
                    <span className="value">{mastersData?.durationTo}</span>
                  </div>
                  <div className="edu-row">
                    <span className="label">Score</span>
                    <span className="value">{mastersData?.marks}</span>
                  </div>
                </div>
              )}

              {graduateData?.university && (
                <div className="resume-item">
                  <strong>Graduation</strong>
                  <div className="edu-row">
                    <span className="label">University</span>
                    <span className="value"> {graduateData?.university}</span>
                  </div>
                  <div className="edu-row">
                    <span className="label">Course</span>
                    <span className="value">{graduateData?.course}</span>
                  </div>

                  <div className="edu-row">
                    <span className="label">Specialization</span>
                    <span className="value">{graduateData?.specialization}</span>
                  </div>
                  <div className="edu-row">
                    <span className="label">Passing Year</span>
                    <span className="value">{graduateData?.durationTo}</span>
                  </div>
                  <div className="edu-row">
                    <span className="label">Score</span>
                    <span className="value">{graduateData?.marks}</span>
                  </div>
                </div>
              )}

              {twelfthData?.board && (
                <div className="resume-item">
                  <strong>Class XII</strong>
                  <div className="edu-row">
                    <span className="label">Board</span>
                    <span className="value">{twelfthData?.board}</span>
                  </div>
                  <div className="edu-row">
                    <span className="label">Stream</span>
                    <span className="value">{twelfthData?.stream}</span>
                  </div>

                  <div className="edu-row">
                    <span className="label">Year</span>
                    <span className="value">{twelfthData?.passYear}</span>
                  </div>

                  <div className="edu-row">
                    <span className="label">Percentage</span>
                    <span className="value">{twelfthData?.marks}%</span>
                  </div>
                </div>
              )}

              {tenthData?.board && (
                <div className="resume-item">
                  <strong>Class X</strong>
                  <div className="edu-row">
                    <span className="label">Board</span>
                    <span className="value">{tenthData?.board}</span>
                  </div>

                  <div className="edu-row">
                    <span className="label">Medium</span>
                    <span className="value">{tenthData?.medium}</span>
                  </div>

                  <div className="edu-row">
                    <span className="label">Year</span>
                    <span className="value">{tenthData?.passYear}</span>
                  </div>

                  <div className="edu-row">
                    <span className="label">Percentage</span>
                    <span className="value">{tenthData?.marks}%</span>
                  </div>
                </div>

              )}
            </section>

            {/* INTERNSHIPS */}
            {internship.length > 0 && (
              <section>
                <h3>INTERNSHIPS</h3>

                {internship.map((item, i) => (
                  <div key={i} className="resume-item">

                    <strong>{item.projectName}</strong>
                    <div className="resume-subtitle">
                      Company Name :  {item.companyName}
                    </div>
                    <div className="resume-subtitle">
                      Skills :  {item.skills.replaceAll("^", ", ")}
                    </div>

                    <div className="resume-subtitle">
                      {item.fromMonth} {item.fromYear}
                      {" - "}
                      {item.currentCompany
                        ? "Present"
                        : `${item.toMonth || ""} ${item.toYear || ""}`}
                    </div>

                    <div className="resume-subtitle">
                      Work Detail :  {item.workProfile}
                    </div>

                  </div>
                ))}
              </section>
            )}

            {/* WORK EXPERIENCE */}
            {experience.length > 0 && (
              <>

                <section >
                  <h3>WORK EXPERIENCE</h3>
                  {experience?.map((exp, i) => (
                    <div key={i} className="resume-item">
                      <strong>{exp.companyName}</strong>
                      <div className="resume-subtitle">
                        {exp.designation}
                      </div>
                      <div className="resume-subtitle">
                        {exp.location}
                      </div>
                      <div className="resume-date">
                        {exp.fromMonth} {exp.fromYear}
                        {" - "}
                        {exp.currentCompany
                          ? "Present"
                          : `${exp.toMonth || ""} ${exp.toYear || ""}`}
                      </div>

                      {exp.workProfile && (
                        <p style={{ borderBottom: "1px solid #cecece", paddingBottom: "5px" }}>{exp.workProfile}</p>
                      )}
                    </div>
                  ))}
                </section>
              </>
            )}



            {experience.length > 0 && (
              <>

                <section >
                  <h3>PROJECTS</h3>

                  {project?.map((proj, i) => (
                    <div key={i} className="resume-item">

                      <strong>{proj.projectName}</strong>

                      <div className="resume-date">
                        {proj.fromMonth} {proj.fromYear}
                        {" - "}
                        {proj.currentlyCompany
                          ? "Present"
                          : `${proj.toMonth || ""} ${proj.toYear || ""}`}
                      </div>

                      {proj.projectDetails && (
                        <p style={{ marginBottom: "5px", paddingBottom: "5px" }} >{proj.projectDetails}</p>
                      )}

                      <p style={{ borderBottom: "1px solid #cecece", paddingBottom: "5px" }}>

                        <strong>skills:  {proj.skills.replaceAll("^", ",")}</strong>
                      </p>

                    </div>
                  ))}
                </section>
              </>
            )}

          </div>
        </div>

      </div >
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