import React, { useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { fetchTimeToMerge } from "./RepoSearch/api";
import { getChartData } from "./RepoSearch/helpers";

ChartJS.register(ArcElement, Tooltip, Legend);

const RepoSearch = () => {
  const [repoLink, setRepoLink] = useState("");
  const [avgTimeToMerge, setAvgTimeToMerge] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event) => {
    setRepoLink(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchTimeToMerge(repoLink, setAvgTimeToMerge, setLoading);
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
