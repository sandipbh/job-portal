
"use client";

const Pagination = ({
  currentPage = 1,
  totalRecords = 0,
  pageSize = 10,
  onPageChange
}) => {
  const totalPages = Math.ceil(totalRecords / pageSize);

  if (totalPages <= 1) return null;

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <nav className="ls-pagination">
      <ul>
        <li className={`prev ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <i className="fa fa-arrow-left"></i>
          </button>
        </li>

        {startPage > 1 && (
          <>
            <li>
              <button type="button" onClick={() => onPageChange(1)}>
                1
              </button>
            </li>
            {startPage > 2 && <li><span>...</span></li>}
          </>
        )}

        {pages.map((page) => (
          <li key={page}>
            <button
              type="button"
              className={currentPage === page ? "current-page" : ""}
              aria-current={currentPage === page ? "page" : undefined}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </li>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <li><span>...</span></li>}
            <li>
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </button>
            </li>
          </>
        )}

        <li className={`next ${currentPage === totalPages ? "disabled" : ""}`}>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <i className="fa fa-arrow-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
