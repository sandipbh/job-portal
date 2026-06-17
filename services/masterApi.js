const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function fetchData(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("API Error");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// University Search
export const searchUniversity = async (term) => {
  if (!term) return [];

  return fetchData(
    `${API_BASE_URL}api/MasterList/university/search?term=${encodeURIComponent(term)}`
  );
};

// PhD Category Search
export const searchPhd = async (term) => {
  if (!term) return [];

  return fetchData(
    `${API_BASE_URL}api/MasterList/phd/search?term=${encodeURIComponent(term)}`
  );
};

// PhD Course Search
export const searchPhdCourses = async (id, term) => {
  if (!term) return [];

  return fetchData(
    `${API_BASE_URL}api/MasterList/phdCourses/search?id=${id}&term=${encodeURIComponent(
      term
    )}`
  );
};