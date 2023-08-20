// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import axios from "axios";
// import { ArcElement, Legend, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const RepoSearch = () => {
  // * track the input value and the result
  const [repoLink, setRepoLink] = useState("");
  const [avgTimeToMerge, setAvgTimeToMerge] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = import.meta.env.VITE_GITHUB_ACCESS_TOKEN;
  // console.log(token);

  // * update the state whenver the input value changes
  const handleInputChange = (event) => {
    setRepoLink(event.target.value);
  };

  //parse link header which provides pagination info
  const parseLinkHeader = (header) => {
    if (!header || header.length === 0) return null;

    const links = {};

    //split parts by comma (extract individual links)
    const parts = header.split(",");

    // For each link, extract the URL and the relation type
    //(e.g. next, prev, last, first)
    for (let i = 0; i < parts.length; i++) {
      const section = parts[i].split(";");
      if (section.length !== 2) {
        throw new Error("section could not be split on ';'");
      }
      const url = section[0].replace(/<(.*)>/, "$1").trim();
      const name = section[1].replace(/rel="(.*)"/, "$1").trim();
      links[name] = url;
    }
    return links;
  };

  //fetch all pages of closed PRS
  const fetchAllClosedPRs = async (url) => {
    try {
      setLoading(true);
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
      setLoading(false);
      return [];
    }
  };

  //    * Calculate the time to merge for each closed pull requests
  //       * and then calculate the average
  const fetchTimeToMerge = async () => {
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

  // * when user submits the form, call the fetchTimeToMerge function
  const handleSubmit = (event) => {
    event.preventDefault();
    fetchTimeToMerge();
  };

// Helper function to calculate the datasets for the Doughnut chart based on avgTimeToMerge
const getChartData = (avgTime) => {
  if (avgTime <= 24) {
    return {
      labels: ["Within 24 Hours", "Within 7 Days", "Beyond 7 Days"],
      datasets: [
        {
          data: [24, 144 - 24, 744 - 144],
          backgroundColor: ["#66ff66", "#FFFF00", "#FF6347"],
        },
      ],
    };
  } else if (avgTime > 24 && avgTime <= 168) {
    return {
      labels: ["Within 24 Hours", "Within 7 Days", "Beyond 7 Days"],
      datasets: [
        {
          data: [0, 168, 744 - 168],
          backgroundColor: ["#66ff66", "#FFFF00", "#FF6347"],
        },
      ],
    };
  } else {
    return {
      labels: ["Within 24 Hours", "Within 7 Days", "Beyond 7 Days"],
      datasets: [
        {
          //31 days limit
          data: [0, 0, 744],  
          backgroundColor: ["#66ff66", "#FFFF00", "#FF6347"],
        },
      ],
    };
  }
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
      {loading && <div>Loading...</div>}
      {avgTimeToMerge !== null && (
        <div>
          <Doughnut
            data={getChartData(avgTimeToMerge)}
            options={{
              circumference: 180,
              rotation: 270,
              responsive: true,
              legend: {
                display: false,
              },
              tooltips: {
                enabled: false,
              },
            }}
          />
          <div className="average-time">
            Average Time to Merge: {avgTimeToMerge.toFixed(2)} hours
          </div>
        </div>
      )}
    </div>
  );
};

export default RepoSearch;
