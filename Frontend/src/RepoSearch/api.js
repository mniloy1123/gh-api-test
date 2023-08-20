import axios from "axios";
import { parseLinkHeader } from "./helpers";

// eslint-disable-next-line no-unused-vars
const token = import.meta.env.VITE_GITHUB_ACCESS_TOKEN;

export const fetchTimeToMerge = async (repoLink, setAvgTimeToMerge, setLoading) => {
    try {
        setLoading(true);
        //clear previous result when loading starts
        setAvgTimeToMerge(null);
        // Extract owner and repo from the repoLink
        const matches = repoLink.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!matches) {
          console.error("Invalid repo link");
          return;
        }
        const owner = matches[1];
        const repo = matches[2];
  
        //all closed PRs for the repo
        const response = await fetchAllClosedPRs(
          `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed`
        );
  
        // Filter out PRs that were not merged
        const mergedPRs = response.filter((pr) => pr.merged_at !== null);
  
        //map through each PR to calculate the time taken to merge it
        const timesToMerge = mergedPRs.map((pr) => {
          const createdAt = new Date(pr.created_at);
          const mergedAt = new Date(pr.merged_at);
          // Convert milliseconds to hours
          return (mergedAt - createdAt) / (1000 * 60 * 60);
        });
        //total time taken to merge all PRs
        const total = timesToMerge.reduce((acc, curr) => acc + curr, 0);
        const average =
          total / timesToMerge.length ? total / timesToMerge.length : 0;
        //update the state with the computed avg time to merge
        setAvgTimeToMerge(average);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
  };
  
  export const fetchAllClosedPRs = async (url) => {
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `token ${token}`,
            },
        });

        // Parse link header to get the pagination links
        const links = parseLinkHeader(response.headers.link);

        // If there's a next page, fetch it recursively
        if (links && links.next) {
            const nextPageData = await fetchAllClosedPRs(links.next);
            return [...response.data, ...nextPageData];
        }

        // If no next page, return the current page data
        return response.data;
    } catch (error) {
        console.error("Error fetching paginated data:", error);
        return [];
    }
};
