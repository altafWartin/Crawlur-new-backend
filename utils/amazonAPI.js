// utils/amazonAPI.js
require("dotenv").config();
const axios = require("axios");

const API_KEY = process.env.API_KEY;
const AMAZON_DOMAIN = process.env.AMAZON_DOMAIN;

const searchProduct = async (query) => {
  try {
    const params = {
      api_key: API_KEY,
      type: "search",
      amazon_domain: AMAZON_DOMAIN,
      search_term: query,
    };

    // Make the HTTP GET request to Rainforest API
    const response = await axios.get("https://api.rainforestapi.com/request", {
      params,
    });

    // Send the JSON response from Rainforest API
    res.json(response.data);
  } catch (error) {
    // Catch and send the error
    console.error(error);
    res.status(500).send("Error fetching data from Rainforest API");
  }
};

module.exports = { searchProduct };
