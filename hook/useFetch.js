import { useState, useEffect } from "react";
import {
  getPopularJobs,
  getNearbyJobs,
  getJobDetails,
  searchJobs,
} from "../firebase/jobServices";

const useFetch = (endpoint, query) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let response;

      // Map endpoints to appropriate Firebase service functions
      switch (endpoint) {
        case "search":
          response = await searchJobs(query.query);
          break;

        case "job-details":
          response = await getJobDetails(query.job_id);
          break;

        case "popular-jobs":
          response = await getPopularJobs();
          break;

        case "nearby-jobs":
          response = await getNearbyJobs();
          break;

        default:
          throw new Error(`Unknown endpoint: ${endpoint}`);
      }

      if (response.status) {
        setData(response.data);
      } else {
        setError(response.error || "Something went wrong");
      }
    } catch (error) {
      setError(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => {
    fetchData();
  };

  return { data, isLoading, error, refetch };
};

export default useFetch;
