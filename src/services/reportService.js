import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5181/api";

export const downloadReport = async ({ startDate, endDate, format, token }) => {
  const response = await axios.get(`${BASE_URL}/admin/reports`, {
    params: {
      startDate,
      endDate,
      format,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob",
  });

  return response;
};