import Social from "./Social";

const CopyrightFooter = () => {
  return (
    <div className="footer-bottom">
      <div className="auto-container">
        <div className="outer-box">
          <div className="copyright-text">
            © {new Date().getFullYear()}  {process.env.NEXT_PUBLIC_APP_NAME}{" "}
            <a
              href="javascript:void(0)"
              target="_blank"
              rel="noopener noreferrer"
            >
              {process.env.NEXT_PUBLIC_APP_NAME}
            </a>
            . All Right Reserved.
          </div>
          <div className="social-links">
            <Social />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopyrightFooter;
