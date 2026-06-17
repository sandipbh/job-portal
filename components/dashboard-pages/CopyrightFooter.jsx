const CopyrightFooter = () => {
  return (
    <div className="copyright-text">
      <p>
        © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME} {" "}
        <a
          href="javascript:void(0)"
          target="_blank"
          rel="noopener noreferrer"
        >
          {process.env.NEXT_PUBLIC_APP_NAME}
        </a>
        . All Right Reserved.
      </p>
    </div>
  );
};

export default CopyrightFooter;
