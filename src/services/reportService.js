import axios from "axios";

const API_URL = "/api/admin/reports";

export const downloadReport = async ({ startDate, endDate, format, token }) => {
  const response = await axios.get(API_URL, {
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