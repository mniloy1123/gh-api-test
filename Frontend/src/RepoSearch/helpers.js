//parse link header which provides pagination info
export const parseLinkHeader = (header) => {
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

  // Helper function to calculate the datasets for the Doughnut chart based on avgTimeToMerge
export const getChartData = (avgTime) => {
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