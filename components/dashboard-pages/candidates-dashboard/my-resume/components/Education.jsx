'use client'
import { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify"

const EducationForm = ({
  data,
  setData,
  onNext,
}) => {


  const [formDataSaveApi, setFormDataSaveApi] = useState({})
  const [universityList, setUniversityList] = useState([]);
  const [showUniversityList, setShowUniversityList] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [showCourseList, setShowCourseList] = useState(false);

  const [SpecializationList, setSpecializationList] = useState([]);
  const [showSpecializationList, setShowSpecializationList] = useState(false);

  const [errors, setErrors] = useState({});
  const [education, setEducation] = useState({
    tenth: null,
    twelfth: null,
    graduation: null,
    postGraduation: null,
    doctorate: null,
  });

  const [activeForm, setActiveForm] = useState("");

  const [formData, setFormData] = useState({
    tenthBoard: "",
    tenthPassingYear: "",
    tenthMedium: "",
    tenthMarks: "",

    twelfthBoard: "",
    twelfthPassingYear: "",
    twelfthStream: "",
    twelfthMarks: "",

    graduateUniversity: "",
    graduateUniversityId: "",
    graduateCourse: "",
    graduateCourseId: "",
    graduateSpecialization: "",
    graduateSpecializationId: "",
    graduateCourseType: "Full Time",
    graduateStartYear: "",
    graduateEndYear: "",
    graduateGradingSystem: "",
    graduateScore: "",

    postgraduateUniversity: "",
    postgraduateUniversityId: "",
    postgraduateCourse: "",
    postgraduateCourseId: "",
    postgraduateSpecialization: "",
    postgraduateSpecializationId: "",
    postgraduateCourseType: "Full Time",
    postgraduateStartYear: "",
    postgraduateEndYear: "",
    postgraduateGradingSystem: "",
    postgraduateScore: "",

    doctorateUniversity: "",
    doctorateUniversityId: "",
    doctorateCourse: "",
    doctorateSpecialization: "",
    doctorateCourseId: "",
    doctorateSpecializationId: "",
    doctorateCourseType: "Full Time",
    doctorateStartYear: "",
    doctorateEndYear: "",
    doctorateGradingSystem: "",
    doctorateScore: "",
  });

  useEffect(() => {
    getEducationDetails();
  }, [0]);

  const getEducationDetails = async () => {
    try {
      const response = await fetch("/api/candi-resume-education", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const result = await response.json();

      //console.log("Education Details fetched:", JSON.stringify(result));

      const profile = result?.data;

      if (profile) {

        const educationData = profile;

        const tenthData = educationData.filter(x => x.education === "10th")[0];
        const twelfthData = educationData.filter(x => x.education === "12th")[0];
        const graduateData = educationData.filter(x => x.education === "Graduate")[0];
        const mastersData = educationData.filter(x => x.education === "Masters")[0];
        const PhDData = educationData.filter(x => x.education === "PhD")[0];

        console.log('graduateData ', graduateData)
        // console.log(tenthData.board)

        setFormData((prev) => ({
          ...prev,

          tenthBoard: tenthData?.board || "",
          tenthPassingYear: tenthData?.passYear || "",
          tenthMedium: tenthData?.medium || "",
          tenthMarks: tenthData?.marks || "",

          twelfthBoard: twelfthData?.board || "",
          twelfthPassingYear: twelfthData?.passYear || "",
          twelfthStream: twelfthData?.stream || "",
          twelfthMarks: twelfthData?.marks || "",

          graduateUniversity: graduateData?.university || "",
          graduateUniversityId: graduateData?.universityId || "",
          graduateCourse: graduateData?.course || "",
          graduateCourseId: graduateData?.courseId || "",
          graduateSpecialization: graduateData?.specialization || "",
          graduateSpecializationId: graduateData?.specializationId || "",
          graduateCourseType: graduateData?.courseType || "",
          graduateStartYear: graduateData?.durationFrom || "",
          graduateEndYear: graduateData?.durationTo || "",
          graduateGradingSystem: graduateData?.gradingSystem || "",
          graduateScore: graduateData?.marks || "",

          postgraduateUniversity: mastersData?.university || "",
          postgraduateUniversityId: mastersData?.universityId || "",
          postgraduateCourse: mastersData?.course || "",
          postgraduateCourseId: mastersData?.courseId || "",
          postgraduateSpecialization: mastersData?.specialization || "",
          postgraduateSpecializationId: mastersData?.specializationId || "",
          postgraduateCourseType: mastersData?.courseType || "",
          postgraduateStartYear: mastersData?.durationFrom || "",
          postgraduateEndYear: mastersData?.durationTo || "",
          postgraduateGradingSystem: mastersData?.gradingSystem || "",
          postgraduateScore: mastersData?.marks || "",

          doctorateUniversity: PhDData?.university || "",
          doctorateUniversityId: PhDData?.universityId || "",
          doctorateCourse: PhDData?.course || "",
          doctorateCourseId: PhDData?.courseId || "",
          doctorateSpecialization: PhDData?.specialization || "",
          doctorateSpecializationId: PhDData?.specializationId || "",
          doctorateCourseType: PhDData?.courseType || "",
          doctorateStartYear: PhDData?.durationFrom || "",
          doctorateEndYear: PhDData?.durationTo || "",
          doctorateGradingSystem: PhDData?.gradingSystem || "",
          doctorateScore: PhDData?.marks || "",

        }));
      }
    } catch (error) {
      console.error(error);
    }
  };



  const openForm = (type) => {
    setActiveForm(type);
  };

  const handleAdd = async (ttype) => {
    let updated = { ...education };
    const formType = ttype;

    setActiveForm(ttype);

    if (!validateEducationForm(formType)) {
      return;
    }

    if (formType === "10th") {
      updated.tenth = {
        board: formData.tenthBoard,
        passingYear: formData.tenthPassingYear,
        medium: formData.tenthMedium,
        marks: formData.tenthMarks,
      };
    }

    if (formType === "12th") {
      updated.twelfth = {
        board: formData.twelfthBoard,
        passingYear: formData.twelfthPassingYear,
        stream: formData.twelfthStream,
        marks: formData.twelfthMarks,
      };
    }

    if (formType === "Graduate") {
      updated.graduation = {
        university: formData.graduateUniversity,
        universityId: formData.graduateUniversityId,
        course: formData.graduateCourse,
        courseId: formData.graduateCourseId,
        specialization: formData.graduateSpecialization,
        specializationId: formData.graduateSpecializationId,
        courseType: formData.graduateCourseType,
        startYear: formData.graduateStartYear,
        endYear: formData.graduateEndYear,
        gradingSystem: formData.graduateGradingSystem,
        score: formData.graduateScore,
      };
    }

    if (formType === "Masters") {
      updated.postGraduation = {
        university: formData.postgraduateUniversity,
        course: formData.postgraduateCourse,
        specialization: formData.postgraduateSpecialization,

        universityId: formData.postgraduateUniversityId,
        courseId: formData.postgraduateCourseId,
        specializationId: formData.postgraduateSpecializationId,

        courseType: formData.postgraduateCourseType,
        startYear: formData.postgraduateStartYear,
        endYear: formData.postgraduateEndYear,
        gradingSystem: formData.postgraduateGradingSystem,
        score: formData.postgraduateScore,
      };
    }

    if (formType === "PhD") {
      updated.doctorate = {
        university: formData.doctorateUniversity,
        course: formData.doctorateCourse,
        specialization: formData.doctorateSpecialization,

        universityId: formData.doctorateUniversityId,
        courseId: formData.doctorateCourseId,
        specializationId: formData.doctorateSpecializationId,

        courseType: formData.doctorateCourseType,
        startYear: formData.doctorateStartYear,
        endYear: formData.doctorateEndYear,
        gradingSystem: formData.doctorateGradingSystem,
        score: formData.doctorateScore,
      };
    }

    const eduData = {
      eduType: formType,
      te_board: formData.tenthBoard,
      te_passingYear: formData.tenthPassingYear,
      te_medium: formData.tenthMedium,
      te_marks: formData.tenthMarks,

      tw_board: formData.twelfthBoard,
      tw_passingYear: formData.twelfthPassingYear,
      tw_stream: formData.twelfthStream,
      tw_marks: formData.twelfthMarks,

      gr_university: formData.graduateUniversity,
      gr_universityId: formData.graduateUniversityId,

      gr_course: formData.graduateCourse,
      gr_specialization: formData.graduateSpecialization,


      gr_courseId: formData.graduateCourseId,
      gr_specializationId: formData.graduateSpecializationId,

      gr_courseType: formData.graduateCourseType,
      gr_startYear: formData.graduateStartYear,
      gr_endYear: formData.graduateEndYear,
      gr_gradingSystem: formData.graduateGradingSystem,
      gr_score: formData.graduateScore,

      pg_university: formData.postgraduateUniversity,
      pg_course: formData.postgraduateCourse,
      pg_specialization: formData.postgraduateSpecialization,

      pg_universityId: formData.postgraduateUniversityId,
      pg_courseId: formData.postgraduateCourseId,
      pg_specializationId: formData.postgraduateSpecializationId,

      pg_courseType: formData.postgraduateCourseType,
      pg_startYear: formData.postgraduateStartYear,
      pg_endYear: formData.postgraduateEndYear,
      pg_gradingSystem: formData.postgraduateGradingSystem,
      pg_score: formData.postgraduateScore,

      ph_university: formData.doctorateUniversity,
      ph_course: formData.doctorateCourse,
      ph_specialization: formData.doctorateSpecialization,

      ph_universityId: formData.doctorateUniversityId,
      ph_courseId: formData.doctorateCourseId,
      ph_specializationId: formData.doctorateSpecializationId,

      ph_courseType: formData.doctorateCourseType,
      ph_startYear: formData.doctorateStartYear,
      ph_endYear: formData.doctorateEndYear,
      ph_gradingSystem: formData.doctorateGradingSystem,
      ph_score: formData.doctorateScore,

    };

    setFormDataSaveApi(eduData);
    console.log('setFormDataSaveApi ', eduData);

    try {

      const res = await fetch("/api/candi-resume-education", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eduData),
      });

      const user = await res.json();

      if (!res.ok) {
        toast.error(user.message || "Save failed..");
        //setLoading(false);
        return;
      }
      setActiveForm("");
      setEducation(updated);
      setData((prev) => ({
        ...prev,
        education: updated,
      }));

      toast.success("Save successfully");
    } catch (error) {
      console.error(error);
      toast.error("Save failed. Please try again.");
    } finally {
      //setLoading(false);
    }
    setActiveForm(null);

    return updated;
  };

  const validateEducationForm = (formType) => {
    const newErrors = {};
    const currentForm = formType || activeForm;

    if (currentForm === "10th") {
      if (!formData.tenthBoard?.trim() || formData.tenthBoard.length < 3) {
        newErrors.tenthBoard = "Board is required";
      }
      if (!formData.tenthPassingYear || formData.tenthPassingYear.length < 4) {
        newErrors.tenthPassingYear = "Passing year is required";
      }
      if (!formData.tenthMedium || formData.tenthMedium.length < 2) {
        newErrors.tenthMedium = "Medium is required";
      }
      if (!formData.tenthMarks || formData.tenthMarks.length < 2) {
        newErrors.tenthMarks = "Marks are required";
      }

    }

    if (currentForm === "12th") {
      if (!formData.twelfthBoard?.trim() || formData.twelfthBoard.length < 3)
        newErrors.twelfthBoard = "Board is required";

      if (!formData.twelfthPassingYear || formData.twelfthPassingYear.length < 3)
        newErrors.twelfthPassingYear = "Passing year is required";

      if (!formData.twelfthStream || formData.twelfthStream.length < 3)
        newErrors.twelfthStream = "Stream is required";

      if (!formData.twelfthMarks || formData.twelfthMarks.length < 2)
        newErrors.twelfthMarks = "Marks are required";
    }

    if (activeForm === "Graduate") {
      if (!formData.graduateUniversity || formData.graduateUniversity.length < 2)
        newErrors.graduateUniversity = "University is required";

      if (!formData.graduateCourse || formData.graduateCourse.length < 2)
        newErrors.graduateCourse = "Course is required";

      if (!formData.graduateStartYear || formData.graduateStartYear.length < 2)
        newErrors.graduateStartYear = "Start year is required";

      if (!formData.graduateEndYear || formData.graduateEndYear.length < 2)
        newErrors.graduateEndYear = "End year is required";

      if (!formData.graduateScore || formData.graduateScore.length < 2)
        newErrors.graduateScore = "Score is required";
    }

    if (activeForm === "Masters") {
      if (!formData.postgraduateUniversity || formData.postgraduateUniversity.length < 2)
        newErrors.postgraduateUniversity = "University is required";

      if (!formData.postgraduateCourse || formData.postgraduateCourse.length < 2)
        newErrors.postgraduateCourse = "Course is required";

      if (!formData.postgraduateStartYear || formData.postgraduateStartYear.length < 2)
        newErrors.postgraduateStartYear = "Start year is required";

      if (!formData.postgraduateEndYear || formData.postgraduateEndYear.length < 2)
        newErrors.postgraduateEndYear = "End year is required";

      if (!formData.postgraduateScore || formData.postgraduateScore.length < 2)
        newErrors.postgraduateScore = "Score is required";
    }

    if (activeForm === "PhD") {
      if (!formData.doctorateUniversity || formData.doctorateUniversity.length < 2)
        newErrors.doctorateUniversity = "University is required";

      if (!formData.doctorateCourse || formData.doctorateCourse.length < 2)
        newErrors.doctorateCourse = "Course is required";

      if (!formData.doctorateStartYear || formData.doctorateStartYear.length < 2)
        newErrors.doctorateStartYear = "Start year is required";

      if (!formData.doctorateEndYear || formData.doctorateEndYear.length < 2)
        newErrors.doctorateEndYear = "End year is required";

      if (!formData.doctorateScore || formData.doctorateScore.length < 2)
        newErrors.doctorateScore = "Score is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const handleAddReturn = (base = education) => {
    let updated = { ...base };

    if (activeForm === "10th") {
      updated.tenth = {
        board: formData.tenthBoard,
        passingYear: formData.tenthPassingYear,
        medium: formData.tenthMedium,
        marks: formData.tenthMarks,
      };
    }

    if (activeForm === "12th") {
      updated.twelfth = {
        board: formData.twelfthBoard,
        passingYear: formData.twelfthPassingYear,
        stream: formData.twelfthStream,
        marks: formData.twelfthMarks,
      };
    }

    if (activeForm === "Graduate") {
      updated.graduation = {
        university: formData.graduateUniversity,
        course: formData.graduateCourse,
        specialization: formData.graduateSpecialization,

        universityId: formData.graduateUniversityId,
        courseId: formData.graduateCourseId,
        specializationId: formData.graduateSpecializationId,


        courseType: formData.graduateCourseType,
        startYear: formData.graduateStartYear,
        endYear: formData.graduateEndYear,
        gradingSystem: formData.graduateGradingSystem,
        score: formData.graduateScore,
      };
    }

    if (activeForm === "Masters") {
      updated.postGraduation = {
        university: formData.postgraduateUniversity,
        course: formData.postgraduateCourse,
        specialization: formData.postgraduateSpecialization,

        universityId: formData.postgraduateUniversityId,
        courseId: formData.postgraduateCourseId,
        specializationId: formData.postgraduateSpecializationId,

        courseType: formData.postgraduateCourseType,
        startYear: formData.postgraduateStartYear,
        endYear: formData.postgraduateEndYear,
        gradingSystem: formData.postgraduateGradingSystem,
        score: formData.postgraduateScore,
      };
    }

    if (activeForm === "PhD") {
      updated.doctorate = {
        university: formData.doctorateUniversity,
        course: formData.doctorateCourse,
        specialization: formData.doctorateSpecialization,

        universityId: formData.doctorateUniversityId,
        courseId: formData.doctorateCourseId,
        specializationId: formData.doctorateSpecializationId,

        courseType: formData.doctorateCourseType,
        startYear: formData.doctorateStartYear,
        endYear: formData.doctorateEndYear,
        gradingSystem: formData.doctorateGradingSystem,
        score: formData.doctorateScore,
      };
    }

    return updated;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let updated = { ...education };

    // FORCE SAVE CURRENT OPEN FORM
    if (activeForm) {
      updated = handleAddReturn(updated);
    }

    setEducation(updated);

    setData((prev) => ({
      ...prev,
      education: updated,
    }));

    onNext();
  };


  const getUniversities = async (term) => {
    if (!term || term.length < 2) {
      setUniversityList([]);
      return;
    }
    //console.log("Fetching universities for term:", term);
    try {

      const response = await fetch("/api/list-university-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: term,
        }),
      });

      const data = await response.json();
      //console.log("Universities fetched:", JSON.stringify(data));

      setUniversityList(data && data.data ? data.data : []);
      setShowUniversityList(true);
    } catch (error) {
      console.error(error);
    }
  };


  const getCourses = async (term) => {
    if (!term || term.length < 2) {
      setCourseList([]);
      return;
    }
    //console.log("Fetching courses for term:", term);
    try {

      const response = await fetch("/api/list-courses-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: term,
          eduType: activeForm,
        }),
      });

      const data = await response.json();
      //console.log("Courses fetched:", JSON.stringify(data));

      setCourseList(data && data.data ? data.data : []);
      setShowCourseList(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getSpecialization = async (term) => {
    if (!term || term.length < 2) {
      setSpecializationList([]);
      return;
    }
    //console.log("Fetching Specialization for term:", term);
    try {
      let courid = "";
      if (activeForm === "PhD") {
        courid = formData.doctorateCourseId;
      } else if (activeForm === "Masters") {
        courid = formData.postgraduateCourseId;
      } else if (activeForm === "Graduate") {
        courid = formData.graduateCourseId;
      }


      const response = await fetch("/api/list-specialization-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term: term,
          eduType: activeForm,
          id: courid || "",
        }),
      });

      const data = await response.json();
      //console.log("Specializations fetched:", JSON.stringify(data));

      setSpecializationList(data && data.data ? data.data : []);
      setShowSpecializationList(true);
    } catch (error) {
      console.error(error);
    }
  };


  return (

    <form
      className="default-form"
      onSubmit={handleSubmit}
    >

      <div className="education-list">

        {/* Class X */}
        <div
          className="education-card"
          onClick={() =>
            setActiveForm("10th")
          }
        >
          {formData.tenth ? (
            <>
              <h5>  Class X Details  </h5>
              <p>Board : {formData.tenthBoard}  Percentage : {formData.tenthMarks}, Passing Year : {formData.tenthPassingYear}</p>
            </>
          ) : (
            <>
              <h5>  Class X Details  </h5>
              <p>Board : {formData.tenthBoard}  Percentage : {formData.tenthMarks}, Passing Year : {formData.tenthPassingYear}</p>
            </>

          )}
          {activeForm === "10th" && (
            <div className="education-form-card">
              <div className="row">

                {/* Board */}
                <div className="form-group col-md-6">
                  <label>Board</label>
                  <select
                    className="form-select"
                    value={formData.tenthBoard || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tenthBoard: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Board</option>

                    <optgroup label="All India">
                      <option value="CBSE">CBSE</option>
                      <option value="CISCE(ICSE/ISC)">CISCE(ICSE/ISC)</option>
                      <option value="Diploma">Diploma</option>
                      <option value="National Open School">National Open School</option>
                      <option value="IB(International Baccalaureate)">IB(International Baccalaureate)</option>
                    </optgroup>

                    <optgroup label="State Boards">
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="J &amp; K">J &amp; K</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                    </optgroup>
                  </select>
                  {errors.tenthBoard && (
                    <span className="error-text">{errors.tenthBoard}</span>
                  )}
                </div>

                {/* Medium */}
                <div className="form-group col-md-6">
                  <label>School Medium</label>

                  <select
                    className="form-select"
                    value={formData.tenthMedium || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tenthMedium: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Medium</option>
                    <option value="Assamese / Asomiya">		 Assamese / Asomiya	  </option>
                    <option value="Bengali / Bangla"> 		 Bengali / Bangla 		  </option>
                    <option value="English"> 				 English 				  </option>
                    <option value="Gujarati"> 				 Gujarati 				  </option>
                    <option value="Hindi"> 					 Hindi 				  </option>
                    <option value="Kannada"> 				 Kannada 				  </option>
                    <option value="Kashmiri"> 				 Kashmiri 				  </option>
                    <option value="Konkani"> 				 Konkani 				  </option>
                    <option value="Malayalam"> 				 Malayalam 			  </option>
                    <option value="Manipuri"> 				 Manipuri 				  </option>
                    <option value="Marathi"> 				 Marathi 				  </option>
                    <option value="Oriya"> 					 Oriya 				  </option>
                    <option value="Punjabi"> 				 Punjabi 				  </option>
                    <option value="Sanskrit"> 				 Sanskrit 				  </option>
                    <option value="Tamil"> 					 Tamil 				  </option>
                    <option value="Telugu"> 					 Telugu 			  </option>
                    <option value="Urdu"> 					 Urdu 					  </option>
                  </select>

                  {errors.tenthMedium && (
                    <span className="error-text">{errors.tenthMedium}</span>
                  )}
                </div>

                {/* Passing Year */}
                <div className="form-group col-md-6">
                  <label>Passing Year</label>

                  <select
                    className="form-select"
                    value={formData.tenthPassingYear || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tenthPassingYear: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Year</option>

                    {Array.from(
                      { length: new Date().getFullYear() - 1990 + 1 },
                      (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      }
                    )}
                  </select>
                  {errors.tenthPassingYear && (
                    <span className="error-text">{errors.tenthPassingYear}</span>
                  )}
                </div>

                {/* Marks */}
                <div className="form-group col-md-6">
                  <label>Marks (%)</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.tenthMarks || ""}
                    maxLength={3}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tenthMarks: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                  />
                  {errors.tenthMarks && (
                    <span className="error-text">{errors.tenthMarks}</span>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-md btn-primary  me-3"
                  onClick={(e) => { setActiveForm("10th"); handleAdd("10th"); }}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  onClick={(e) => { e.stopPropagation(); setActiveForm(""); }}
                >Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Class XII */}
        <div
          className="education-card"
          onClick={() =>
            setActiveForm("12th")
          }
        >
          {formData.twelfth ? (
            <>
              <h5>  Class XII Details</h5>
              <p> Board : {formData.twelfthBoard}, Percentage : {formData.twelfthMarks}, Passing Year : {formData.twelfthPassingYear}</p>

            </>
          ) : (
            <>
              <h5>  Class XII Details</h5>
              <p>Board : {formData.twelfthBoard}, Percentage : {formData.twelfthMarks}, Passing Year : {formData.twelfthPassingYear}</p>
            </>
          )}

          {activeForm === "12th" && (
            <div className="education-form-card">
              <div className="row">
                <div className="form-group col-md-6">
                  <label>Board</label>
                  <select
                    value={formData.twelfthBoard || ""}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        twelfthBoard: e.target.value,
                      }));

                      setErrors((prev) => ({
                        ...prev,
                        twelfthBoard: "",
                      }));
                    }}
                  >
                    <option value="">Select Board</option>

                    <optgroup label="All India">
                      <option value="CBSE">CBSE</option>
                      <option value="CISCE(ICSE/ISC)">CISCE(ICSE/ISC)</option>
                      <option value="Diploma">Diploma</option>
                      <option value="National Open School">National Open School</option>
                      <option value="IB(International Baccalaureate)">IB(International Baccalaureate)</option>
                    </optgroup>

                    <optgroup label="State Boards">
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="J &amp; K">J &amp; K</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                    </optgroup>
                  </select>
                  {errors.twelfthBoard && (
                    <span className="error-text">{errors.twelfthBoard}</span>
                  )}

                </div>

                {/* Passing Year */}
                <div className="form-group col-md-6">
                  <label>Passing Out Year</label>

                  <select

                    value={formData.twelfthPassingYear || ""}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        twelfthPassingYear: e.target.value,
                      }));

                      setErrors((prev) => ({
                        ...prev,
                        twelfthPassingYear: "",
                      }));
                    }}
                  >
                    <option value="">Select Year</option>

                    {Array.from(
                      { length: new Date().getFullYear() - 1990 + 1 },
                      (_, i) => {
                        const year = new Date().getFullYear() - i;

                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      }
                    )}
                  </select>
                  {errors.twelfthPassingYear && (
                    <span className="error-text">{errors.twelfthPassingYear}</span>
                  )}

                </div>

                {/* Stream */}
                <div className="form-group col-md-6">
                  <label>Stream</label>

                  <select
                    value={formData.twelfthStream || ""}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        twelfthStream: e.target.value,
                      }));

                      setErrors((prev) => ({
                        ...prev,
                        twelfthStream: "",
                      }));
                    }}
                  >
                    <option value="">Select Stream</option>
                    <option value="Science">Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Arts">Arts</option>
                    <option value="Vocational">Vocational</option>
                  </select>
                  {errors.twelfthStream && (
                    <span className="error-text">{errors.twelfthStream}</span>
                  )}

                </div>

                {/* Marks */}
                <div className="form-group col-md-6">
                  <label>Marks (%)</label>

                  <input
                    type="tel"
                    placeholder="Enter Percentage"
                    value={formData.twelfthMarks || ""}
                    maxLength={3}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        twelfthMarks: e.target.value.replace(/\D/g, ""),
                      }))
                    }

                  />

                  {errors.twelfthMarks && (
                    <span className="error-text">{errors.twelfthMarks}</span>
                  )}

                </div>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-md btn-primary  me-3"
                  onClick={(e) => { setActiveForm("12th"); handleAdd("12th"); }}
                >
                  Save
                </button>

                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  onClick={(e) => { e.stopPropagation(); setActiveForm(""); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>



        {/* Graduation */}
        <div
          className="education-card"
          onClick={() =>
            setActiveForm("Graduate")
          }
        >
          {education.graduation ? (
            <>
              <h5>  Graduation Details</h5>
              <p>Course : {formData.graduateCourse},
                University / Institute : {formData.graduateUniversity},
                Passing Year : {formData.graduateEndYear}</p>
            </>
          ) : (
            <>
              <h5>  Graduation Details</h5>
              <p>Course : {formData.graduateCourse},
                University / Institute : {formData.graduateUniversity},
                Passing Year : {formData.graduateEndYear}</p>
            </>
          )}


          {activeForm === "Graduate" && (
            <div className="education-form-card">
              <div className="row">
                {/* University */}
                <div className="form-group col-lg-12">
                  <label>University / Institute  </label>
                  <input
                    type="text"
                    value={formData.graduateUniversity || ""}

                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        graduateUniversity: e.target.value,
                        graduateUniversityId: e.target.key,
                      }));

                      getUniversities(e.target.value);
                      setShowUniversityList(true);
                    }}

                  />
                  {showUniversityList && universityList.length > 0 && (
                    <ul
                      style={{
                        position: "absolute",
                        width: "96%",
                        background: "#fff",
                        border: "1px solid rgb(185 198 239)",
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 1000,
                      }}
                    >
                      {universityList.map((item) => (
                        <li
                          key={item.key}
                          style={{
                            padding: "4px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              graduateUniversity: item.value,
                              graduateUniversityId: item.key,
                            }));

                            setShowUniversityList(false);
                          }}
                        >
                          {item.value}
                        </li>
                      ))}
                    </ul>
                  )}

                  {errors.graduateUniversity && (
                    <span className="error-text">{errors.graduateUniversity}</span>
                  )}
                </div>

                {/* Course */}
                <div className="form-group col-md-6">
                  <label>Course</label>
                  <input
                    placeholder="Start typing to search courses..."
                    type="text"
                    value={formData.graduateCourse || ""}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        graduateCourse: e.target.value,
                        graduateCourseId: e.target.key,
                      }));

                      getCourses(e.target.value);
                      setShowCourseList(true);
                    }}
                  />
                  {showCourseList && courseList.length > 0 && (
                    <ul
                      style={{
                        position: "absolute",
                        width: "96%",
                        background: "#fff",
                        border: "1px solid rgb(185 198 239)",
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 1000,
                      }}
                    >
                      {courseList.map((item) => (
                        <li
                          key={item.key}
                          style={{
                            padding: "4px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              graduateCourse: item.value,
                              graduateCourseId: item.key,
                            }));

                            setShowCourseList(false);
                          }}
                        >
                          {item.value}
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.graduateCourse && (
                    <span className="error-text">{errors.graduateCourse}</span>
                  )}
                </div>

                {/* Specialization */}
                <div className="form-group col-md-6">
                  <label>Specialization</label>

                  <input
                    placeholder="Start typing to search specializations..."
                    type="text"
                    value={formData.graduateSpecialization || ""}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        graduateSpecialization: e.target.value,
                        graduateSpecializationId: e.target.key,
                      }));

                      getSpecialization(e.target.value);
                      setShowSpecializationList(true);
                    }}
                  />

                  {showSpecializationList && SpecializationList.length > 0 && (
                    <ul
                      style={{
                        position: "absolute",
                        width: "96%",
                        background: "#fff",
                        border: "1px solid rgb(185 198 239)",
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 1000,
                      }}
                    >
                      {SpecializationList.map((item) => (
                        <li
                          key={item.key}
                          style={{
                            padding: "4px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              graduateSpecialization: item.value,
                              graduateSpecializationId: item.key,
                            }));

                            setShowSpecializationList(false);
                          }}
                        >
                          {item.value}
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.graduateSpecialization && (
                    <span className="error-text">{errors.graduateSpecialization}</span>
                  )}
                </div>

                {/* Course Type */}
                <div className="form-group col-lg-12">
                  <label>Course Type</label>

                  <div className="course-type-group">
                    {[
                      "Full Time",
                      "Part Time",
                      "Distance Learning",
                    ].map((type) => (
                      <label key={type} className="radio-option">
                        <input
                          type="radio"
                          name={`courseType-${activeForm}`}
                          checked={
                            formData.graduateCourseType === type
                          }
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              graduateCourseType: type,
                            }))
                          }
                        />
                        {type}
                      </label>
                    ))}
                  </div>

                </div>

                {/* Duration */}
                <div className="form-group col-md-6">
                  <label>Starting Year</label>

                  <select
                    className="form-select"
                    value={formData.graduateStartYear || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        graduateStartYear: e.target.value,
                      }))
                    }
                  >
                    <option value="">Starting Year</option>

                    {Array.from({ length: 20 }, (_, i) => {
                      const year = 2010 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>

                  {errors.graduateStartYear && (
                    <span className="error-text">{errors.graduateStartYear}</span>
                  )}
                </div>

                <div className="form-group col-md-6">
                  <label>Ending Year</label>

                  <select
                    className="form-select"
                    value={formData.graduateEndYear || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        graduateEndYear: e.target.value,
                      }))
                    }
                  >
                    <option value="">Ending Year</option>

                    {Array.from({ length: 20 }, (_, i) => {
                      const year = 2010 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                  {errors.graduateEndYear && (
                    <span className="error-text">{errors.graduateEndYear}</span>
                  )}
                </div>

                {/* Grading System */}
                <div className="form-group col-md-6">
                  <label>Grading System</label>
                  <select
                    className="form-select"
                    value={formData.graduateGradingSystem || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        graduateGradingSystem: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Grading System</option>
                    <option>Percentage</option>
                    <option>CGPA</option>
                    <option>GPA</option>
                  </select>
                  {errors.graduateGradingSystem && (
                    <span className="error-text">{errors.graduateGradingSystem}</span>
                  )}
                </div>

                {/* Score */}
                <div className="form-group col-md-6">
                  <label>Percentage / CGPA</label>

                  <input
                    type="text"
                    placeholder="Enter score"
                    value={formData.graduateScore || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        graduateScore: e.target.value,
                      }))
                    }
                  />
                  {errors.graduateScore && (
                    <span className="error-text">{errors.graduateScore}</span>
                  )}
                </div>

              </div>
              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-md btn-primary  me-3"
                  onClick={(e) => { setActiveForm("Graduate"); handleAdd("Graduate"); }}
                >
                  Save
                </button>

                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  onClick={(e) => { e.stopPropagation(); setActiveForm(""); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>




        {/*Post Graduation */}
        <div
          className="education-card"
          onClick={() =>
            setActiveForm("Masters")

          }
        >
          {education.postGraduation ? (
            <>
              <h5>  Post Graduation Details</h5>
              <p>Course : {formData.postgraduateCourse},
                University / Institute : {formData.postgraduateUniversity},
                Passing Year : {formData.postgraduateEndYear}</p>
            </>
          ) : (
            <>
              <h5>  Post Graduation Details</h5>
              <p>Course : {formData.postgraduateCourse},
                University / Institute : {formData.postgraduateUniversity},
                Passing Year : {formData.postgraduateEndYear}</p>

            </>
          )}

          {activeForm === "Masters" && (
            <div className="education-form-card">
              <div className="row">
                {/* University */}
                <div className="form-group col-lg-12">
                  <label>University / Institute</label>
                  <input
                    type="text"
                    value={formData.postgraduateUniversity || ""}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        postgraduateUniversity: e.target.value,
                        postgraduateUniversityId: e.target.key,
                      }));

                      getUniversities(e.target.value);
                      setShowUniversityList(true);
                    }}
                  />
                  {showUniversityList && universityList.length > 0 && (
                    <ul
                      style={{
                        position: "absolute",
                        width: "96%",
                        background: "#fff",
                        border: "1px solid rgb(185 198 239)",
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 1000,
                      }}
                    >
                      {universityList.map((item) => (
                        <li
                          key={item.key}
                          style={{
                            padding: "4px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              postgraduateUniversity: item.value,
                              postgraduateUniversityId: item.key,
                            }));

                            setShowUniversityList(false);
                          }}
                        >
                          {item.value}
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.postgraduateUniversity && (
                    <span className="error-text">{errors.postgraduateUniversity}</span>
                  )}


                </div>

                {/* Course */}
                <div className="form-group col-md-6">
                  <label>Course</label>
                  <input
                    placeholder="Start typing to search specializations..."
                    type="text"
                    value={formData.postgraduateCourse || ""}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        postgraduateCourse: e.target.value,
                        postgraduateCourseId: e.target.key,
                      }));

                      getCourses(e.target.value);
                      setShowCourseList(true);
                    }}
                  />

                  {showCourseList && courseList.length > 0 && (
                    <ul
                      style={{
                        position: "absolute",
                        width: "96%",
                        background: "#fff",
                        border: "1px solid rgb(185 198 239)",
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 1000,
                      }}
                    >
                      {courseList.map((item) => (
                        <li
                          key={item.key}
                          style={{
                            padding: "4px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              postgraduateCourse: item.value,
                              postgraduateCourseId: item.key,
                            }));

                            setShowCourseList(false);
                          }}
                        >
                          {item.value}
                        </li>
                      ))}
                    </ul>
                  )}

                  {errors.postgraduateCourse && (
                    <span className="error-text">{errors.postgraduateCourse}</span>
                  )}
                </div>

                {/* Specialization */}
                <div className="form-group col-md-6">
                  <label>Specialization</label>
                  <input
                    placeholder="Start typing to search specializations..."
                    type="text"
                    value={formData.postgraduateSpecialization || ""}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        postgraduateSpecialization: e.target.value,
                        postgraduateSpecializationId: e.target.key,
                      }));

                      getSpecialization(e.target.value);
                      setShowSpecializationList(true);
                    }}
                  />

                  {showSpecializationList && SpecializationList.length > 0 && (
                    <ul
                      style={{
                        position: "absolute",
                        width: "96%",
                        background: "#fff",
                        border: "1px solid rgb(185 198 239)",
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 1000,
                      }}
                    >
                      {SpecializationList.map((item) => (
                        <li
                          key={item.key}
                          style={{
                            padding: "4px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              postgraduateSpecialization: item.value,
                              postgraduateSpecializationId: item.key,
                            }));

                            setShowSpecializationList(false);
                          }}
                        >
                          {item.value}
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.postgraduateSpecialization && (
                    <span className="error-text">{errors.postgraduateSpecialization}</span>
                  )}
                </div>

                {/* Course Type */}
                <div className="form-group col-lg-12">
                  <label>Course Type</label>

                  <div className="course-type-group">
                    {[
                      "Full Time",
                      "Part Time",
                      "Distance Learning",
                    ].map((type) => (
                      <label key={type} className="radio-option">
                        <input
                          type="radio"
                          name={`courseType-${activeForm}`}
                          checked={
                            formData.postgraduateCourseType === type
                          }
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              postgraduateCourseType: type,
                            }))
                          }
                        />
                        {type}
                      </label>
                    ))}
                  </div>

                </div>

                {/* Duration */}
                <div className="form-group col-md-6">
                  <label>Starting Year</label>

                  <select
                    className="form-select"
                    value={formData.postgraduateStartYear || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        postgraduateStartYear: e.target.value,
                      }))
                    }
                  >
                    <option value="">Starting Year</option>

                    {Array.from({ length: 20 }, (_, i) => {
                      const year = 2010 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>

                  {errors.postgraduateStartYear && (
                    <span className="error-text">{errors.postgraduateStartYear}</span>
                  )}
                </div>

                <div className="form-group col-md-6">
                  <label>Ending Year</label>

                  <select
                    className="form-select"
                    value={formData.postgraduateEndYear || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        postgraduateEndYear: e.target.value,
                      }))
                    }
                  >
                    <option value="">Ending Year</option>

                    {Array.from({ length: 20 }, (_, i) => {
                      const year = 2010 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>

                  {errors.postgraduateEndYear && (
                    <span className="error-text">{errors.postgraduateEndYear}</span>
                  )}
                </div>

                {/* Grading System */}
                <div className="form-group col-md-6">
                  <label>Grading System</label>

                  <select
                    className="form-select"
                    value={formData.postgraduateGradingSystem || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        postgraduateGradingSystem: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Grading System</option>
                    <option>Percentage</option>
                    <option>CGPA</option>
                    <option>GPA</option>
                  </select>

                  {errors.postgraduateGradingSystem && (
                    <span className="error-text">{errors.postgraduateGradingSystem}</span>
                  )}
                </div>

                {/* Score */}
                <div className="form-group col-md-6">
                  <label>Percentage / CGPA</label>

                  <input
                    type="text"
                    placeholder="Enter score"
                    value={formData.postgraduateScore || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        postgraduateScore: e.target.value,
                      }))
                    }
                  />

                  {errors.postgraduateScore && (
                    <span className="error-text">{errors.postgraduateScore}</span>
                  )}

                </div>

              </div>
              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-md btn-primary  me-3"

                  onClick={(e) => { setActiveForm("Masters"); handleAdd("Masters"); }}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  onClick={(e) => { e.stopPropagation(); setActiveForm(""); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>


        {/*Doctorate */}
        <div
          className="education-card"
          onClick={() =>
            setActiveForm("PhD")
          }
        >
          {education.doctorate ? (
            <>
              <h5>  Doctorate/PhD Details</h5>
              <p>Course : {formData.doctorateCourse},
                University / Institute : {formData.doctorateUniversity},  Passing Year : {formData.doctorateEndYear}</p>

            </>
          ) : (
            <>
              <h5>  Doctorate/PhD Details</h5>
              <p>Course : {formData.doctorateCourse},
                University / Institute : {formData.doctorateUniversity},  Passing Year : {formData.doctorateEndYear}</p>

            </>
          )}


          {activeForm === "PhD" && (
            <div className="education-form-card">
              <div className="row">
                {/* University */}
                <div className="form-group col-lg-12">
                  <label>University / Institute</label>
                  <input
                    type="text"
                    value={formData.doctorateUniversity || ""}

                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        doctorateUniversity: e.target.value,
                        doctorateUniversityId: e.target.key,
                      }));

                      getUniversities(e.target.value);
                      setShowUniversityList(true);
                    }}
                  />
                  {showUniversityList && universityList.length > 0 && (
                    <ul
                      style={{
                        position: "absolute",
                        width: "96%",
                        background: "#fff",
                        border: "1px solid rgb(185 198 239)",
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 1000,
                      }}
                    >
                      {universityList.map((item) => (
                        <li
                          key={item.key}
                          style={{
                            padding: "4px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              doctorateUniversity: item.value,
                              doctorateUniversityId: item.key,
                            }));

                            setShowUniversityList(false);
                          }}
                        >
                          {item.value}
                        </li>
                      ))}
                    </ul>
                  )}

                  {errors.doctorateUniversity && (
                    <span className="error-text">{errors.doctorateUniversity}</span>
                  )}
                </div>

                {/* Course */}
                <div className="form-group col-md-6">
                  <label>Course</label>
                  <input
                    type="text"
                    value={formData.doctorateCourse || ""}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        doctorateCourse: e.target.value,
                        doctorateCourseId: e.target.key,
                      }));

                      getCourses(e.target.value);
                      setShowCourseList(true);
                    }}
                  />

                  {showCourseList && courseList.length > 0 && (
                    <ul
                      style={{
                        position: "absolute",
                        width: "96%",
                        background: "#fff",
                        border: "1px solid rgb(185 198 239)",
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 1000,
                      }}
                    >
                      {courseList.map((item) => (
                        <li
                          key={item.key}
                          style={{
                            padding: "4px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              doctorateCourse: item.value,
                              doctorateCourseId: item.key,
                            }));

                            setShowCourseList(false);
                          }}
                        >
                          {item.value}
                        </li>
                      ))}
                    </ul>
                  )}

                  {errors.doctorateCourse && (
                    <span className="error-text">{errors.doctorateCourse}</span>
                  )}
                </div>

                {/* Specialization */}
                <div className="form-group col-md-6">
                  <label>Specialization </label>
                  <input
                    type="text"
                    value={formData.doctorateSpecialization || ""}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        doctorateSpecialization: e.target.value,
                        doctorateSpecializationId: e.target.key,
                      }));

                      getSpecialization(e.target.value);
                      setShowSpecializationList(true);
                    }}
                  />

                  {showSpecializationList && SpecializationList.length > 0 && (
                    <ul
                      style={{
                        position: "absolute",
                        width: "96%",
                        background: "#fff",
                        border: "1px solid rgb(185 198 239)",
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 1000,
                      }}
                    >
                      {SpecializationList.map((item) => (
                        <li
                          key={item.key}
                          style={{
                            padding: "4px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              doctorateSpecialization: item.value,
                              doctorateSpecializationId: item.key,
                            }));

                            setShowSpecializationList(false);
                          }}
                        >
                          {item.value}
                        </li>
                      ))}
                    </ul>
                  )}

                  {errors.doctorateSpecialization && (
                    <span className="error-text">{errors.doctorateSpecialization}</span>
                  )}
                </div>

                {/* Course Type */}
                <div className="form-group col-lg-12">
                  <label>Course Type</label>

                  <div className="course-type-group">
                    {[
                      "Full Time",
                      "Part Time",
                      "Distance Learning",
                    ].map((type) => (
                      <label key={type} className="radio-option">
                        <input
                          type="radio"
                          name={`courseType-${activeForm}`}
                          checked={
                            formData.doctorateCourseType === type
                          }
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              doctorateCourseType: type,
                            }))
                          }
                        />
                        {type}
                      </label>
                    ))}
                  </div>

                </div>

                {/* Duration */}
                <div className="form-group col-md-6">
                  <label>Starting Year</label>

                  <select
                    className="form-select"
                    value={formData.doctorateStartYear || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        doctorateStartYear: e.target.value,
                      }))
                    }
                  >
                    <option value="">Starting Year</option>

                    {Array.from({ length: 20 }, (_, i) => {
                      const year = 2010 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>

                  {errors.doctorateStartYear && (
                    <span className="error-text">{errors.doctorateStartYear}</span>
                  )}
                </div>

                <div className="form-group col-md-6">
                  <label>Ending Year</label>

                  <select
                    className="form-select"
                    value={formData.doctorateEndYear || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        doctorateEndYear: e.target.value,
                      }))
                    }
                  >
                    <option value="">Ending Year</option>

                    {Array.from({ length: 20 }, (_, i) => {
                      const year = 2010 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                  {errors.doctorateEndYear && (
                    <span className="error-text">{errors.doctorateEndYear}</span>
                  )}
                </div>

                {/* Grading System */}
                <div className="form-group col-md-6">
                  <label>Grading System</label>

                  <select
                    className="form-select"
                    value={formData.doctorateGradingSystem || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        doctorateGradingSystem: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Grading System</option>
                    <option>Percentage</option>
                    <option>CGPA</option>
                    <option>GPA</option>
                  </select>
                  {errors.doctorateGradingSystem && (
                    <span className="error-text">{errors.doctorateGradingSystem}</span>
                  )}
                </div>

                {/* Score */}
                <div className="form-group col-md-6">
                  <label>Percentage / CGPA</label>

                  <input
                    type="text"
                    placeholder="Enter score"
                    value={formData.doctorateScore || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        doctorateScore: e.target.value,
                      }))
                    }
                  />
                  {errors.doctorateScore && (
                    <span className="error-text">{errors.doctorateScore}</span>
                  )}
                </div>

              </div>
              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-md btn-primary  me-3"
                  onClick={(e) => { setActiveForm("PhD"); handleAdd("PhD"); }}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-md btn-secondary"
                  onClick={(e) => { e.stopPropagation(); setActiveForm(""); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>


      </div>

      {/* FINAL SAVE */}
      <div className="form-group col-12 mt-4 text-end">
        <button
          type="submit"
          className="theme-btn btn-style-one"
        >
          Next
        </button>
      </div>

    </form >
  );
}
export default EducationForm;