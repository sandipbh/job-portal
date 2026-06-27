import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";


// GET Method 
export async function GET(req) {
  const headersList = await headers();

  const token = req.cookies.get("regToken")?.value;
  const url = req.nextUrl.pathname;

  const JobPostId = req.nextUrl.searchParams.get("JobPostId");

  let user = {};
  try {
    user = JSON.parse(token);
  } catch (err) {
    console.error("Invalid JSON token:", err);
    user = {};
  }

  try {

    const loginBody = {
      JobPostId: JobPostId,
      uqId: user.external.uqId,
      Role: user.external.role,
      Token: user.external.accessToken,
    };

    // Allow self-signed certs in local development only.
    if (process.env.NODE_ENV !== "production") {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const externalApiBaseUrl = process.env.API_BASE_URL;
    if (!externalApiBaseUrl) {
      return NextResponse.json(
        { message: "API_BASE_URL is not configured." },
        { status: 500 }
      );
    }

    const externalApiUrl =
      process.env.REGISTER_API_URL ||
      `${externalApiBaseUrl.replace(/\/+$/, "")}/jobPosting/getJobDetails`;


    const externalResponse = await apiFetch(externalApiUrl, {
      method: "POST",
      body: JSON.stringify(loginBody),
    });

    const responseData = JSON.parse(await externalResponse.text());

    const response = NextResponse.json(
      {
        data: responseData || [],
      },
      { status: 201 }
    );
    return response;

  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch profile details" },
      { status: 500 }
    );
  }
}


export async function POST(req) {
  const headersList = await headers();

  const token = req.cookies.get("regToken")?.value;
  const url = req.nextUrl.pathname;

  let user = {};
  try {
    user = JSON.parse(token);
  } catch (err) {
    console.error("Invalid JSON token:", err);
    user = {};
  }
  console.log("dashboard user User Role :", user.external.role);

  try {
    const {
      jobpostId,
      companyName,
      jobTitle,
      jobTitleId,
      minExperience,
      maxExperience,
      fresherAllowed,
      jobType,
      workMode,


      minSalary,
      maxSalary,

      incentives,

      department,
      departmentId,
      jobRole,
      jobRoleId,
      jobLocation,
      jobLocationId,
      qualification,

      degree,
      degreeId,

      specialization,
      specializationId,
      skills,
      industryIds,

      languages,
      languagesId,

      gender,

      contactMethod,
      cemail,
      cphone,
      callFrom,
      callTo,
      applicationMethod,
      externalLink,
      allowDirectCall,
      days,
      jobDesc,
      aboutCompany,
      screeningQuestions,

      isWalkIn,
      walkInStartDate,
      walkInEndDate,
      walkInTimingFrom,
      walkInTimingTo,
      recruiterName,
      walkInPhone,
      venueAddress,
      googleMapsUrl,
      collaborators,
      newCollaborator,
      dailyDigest


    } = await req.json();

    // 1. Basic validation
    if (!user.external.uqId || !user.external.role) {
      return NextResponse.json(
        { message: "Email and role are required" },
        { status: 400 }
      );
    }

    const LoginIp =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      headersList.get("cf-connecting-ip") ||
      "Unknown";

    const loginBody = {

      jobpostId: jobpostId,
      companyName: companyName,
      jobTitle: jobTitle,
      jobTitleId: jobTitleId,
      minExperience: minExperience,
      maxExperience: maxExperience,
      fresherAllowed: fresherAllowed ?? false,
      jobType: jobType,
      workMode: workMode,

      minSalary: minSalary,
      maxSalary: maxSalary,

      incentives: incentives,

      department: department,
      departmentId: departmentId,
      jobRole: jobRole,
      jobRoleId: jobRoleId,
      jobLocation: jobLocation,
      jobLocationId: jobLocationId,
      qualification: qualification,

      degree: degree,
      degreeId: degreeId,

      specialization: specialization,
      specializationId: specializationId,
      skills: skills,
      industryIds: industryIds,
      languages: languages,
      languagesId: languagesId,


      gender: gender,

      contactMethod: contactMethod,
      cemail: cemail,
      cphone: cphone,
      callFrom: callFrom,
      callTo: callTo,
      applicationMethod: applicationMethod,
      externalLink: externalLink,
      allowDirectCall: allowDirectCall,
      days: days,

      jobDesc: jobDesc,
      aboutCompany: aboutCompany,
      screeningQuestions: screeningQuestions,


      isWalkIn: isWalkIn,
      walkInStartDate: walkInStartDate,
      walkInEndDate: walkInEndDate,
      walkInTimingFrom: walkInTimingFrom,
      walkInTimingTo: walkInTimingTo,
      recruiterName: recruiterName,
      walkInPhone: walkInPhone,
      venueAddress: venueAddress,
      googleMapsUrl: googleMapsUrl,
      collaborators: collaborators,
      newCollaborator: newCollaborator,
      dailyDigest: dailyDigest,

      uqId: user.external.uqId,
      LoginIp: LoginIp,
      Role: user.external.role,
      Token: user.external.accessToken,
    };
    console.log("body Data:", loginBody);

    // Allow self-signed certs in local development only.
    if (process.env.NODE_ENV !== "production") {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const externalApiBaseUrl = process.env.API_BASE_URL;
    if (!externalApiBaseUrl) {
      return NextResponse.json(
        { message: "API_BASE_URL is not configured." },
        { status: 500 }
      );
    }
    console.log("External API Base URL :", externalApiBaseUrl);

    const externalApiUrl =
      process.env.REGISTER_API_URL ||
      `${externalApiBaseUrl.replace(/\/+$/, "")}/jobPosting/postJob`;

    console.log("External API URL :", externalApiUrl);
    console.log("External API Request Body:", loginBody);

    const externalResponse = await apiFetch(externalApiUrl, {
      method: "POST",
      body: JSON.stringify(loginBody),
    });

    const responseData = JSON.parse(await externalResponse.text());

    console.log("External Candi API response:", responseData);
    console.log("External API Response Status:", responseData.message || externalResponse.status);


    if (!externalResponse.ok) {
      console.error(
        "External jobpost failed:",
        responseData.success,
        responseData.message
      );

      return NextResponse.json(
        {
          message: responseData.message || "Job Post Failed",
        },
        { status: responseData.status || 500 }
      );
    }

    console.log("Job Posted successfully");

    // 6. Send response with cookies
    const response = NextResponse.json(
      {
        message: responseData.message || "Job Posted successfully",
      },
      { status: 201 }
    );

    return response;
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update Profile" },
      { status: 500 }
    );
  }
}