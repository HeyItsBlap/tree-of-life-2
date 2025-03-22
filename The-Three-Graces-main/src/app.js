const fetchSubnodes = (node_id = "ott93302") => {
  fetch("https://api.opentreeoflife.org/v3/tree_of_life/subtree", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      node_id: "ott93302",
      format: "arguson",
      height_limit: 1
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
