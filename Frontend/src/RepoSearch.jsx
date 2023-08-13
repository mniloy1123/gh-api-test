// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import axios from "axios";

const RepoSearch = () => {
  // * track the input value and the result
  const [repoLink, setRepoLink] = useState("");
  const [avgTimeToMerge, setAvgTimeToMerge] = useState(null);

  // * update the state whenver the input value changes
  const handleInputChange = (event) => {
    setRepoLink(event.target.value);
  };

//    * Calculate the time to merge for each closed pull requests
//       * and then calculate the average 
  const fetchTimeToMerge = async () => {
    try {
      // Extract owner and repo from the repoLink
      const matches = repoLink.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!matches) {
        console.error("Invalid repo link");
        return;
      }
      const owner = matches[1];
      const repo = matches[2];

      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed`
      );

      // Filter pull requests that were merged 
      const mergedPRs = response.data.filter((pr) => pr.merged_at !== null);

      const timesToMerge = mergedPRs.map((pr) => {
        const createdAt = new Date(pr.created_at);
        const mergedAt = new Date(pr.merged_at);
        // Convert milliseconds to hours
        return (mergedAt - createdAt) / (1000 * 60 * 60); 
      });

      const total = timesToMerge.reduce((acc, curr) => acc + curr, 0);
      const average = total / timesToMerge.length ? total / timesToMerge.length : 0;

      setAvgTimeToMerge(average);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // * when user submits the form, call the fetchTimeToMerge function
  const handleSubmit = (event) => {
    event.preventDefault(); 
    fetchTimeToMerge();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          name="myInput"
          placeholder="Github Repo Link"
          value={repoLink}
          onChange={handleInputChange}
        />
        <button type="submit">Fetch Data</button>
      </form>
      {avgTimeToMerge !== null && (
        //format avgTimeToMerge to have exactly 2 decimal places
        <div>Average Time to Merge: {avgTimeToMerge.toFixed(2)} hours</div>
      )}
    </div>
  );
};

export default RepoSearch;
