
import "../styles/index.scss";
import "aos/dist/aos.css";
import "react-toastify/dist/ReactToastify.css";
import "rc-slider/assets/index.css";
import "quill/dist/quill.snow.css";
import "react-loading-skeleton/dist/skeleton.css";
import Providers from "./providers";

export const metadata = {
  title: "RatinGrow - Hiring Verified",
  description: "RatinGrow - Hiring Verified",
  keywords: [
    "candidates", "career", "employment", "job board",
    "job listing", "job portal", "job postings", "job search",
    "job seeker", "jobs", "recruiters", "recruitment", "resume"
  ],
  other: {
    "x-ua-compatible": "ie=edge"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
