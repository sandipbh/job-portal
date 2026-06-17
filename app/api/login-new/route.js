import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/auth";

export async function GET() {
  return NextResponse.json({
    message: "API Route Working",
  });
}