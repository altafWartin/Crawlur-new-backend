const fetchProductFromAmazon = async (asin) => {
    try {
      // Log serial: Product not found, fetching from Amazon
      console.log("Fetching product from Amazon for ASIN:", asin);
  
      const params = {
        api_key: process.env.API_KEY,
        amazon_domain: process.env.AMAZON_DOMAIN,
        asin,
        type: "product",
      };
  
      // Make the HTTP GET request to Rainforest API
      const response = await axios.get("https://api.rainforestapi.com/request", {
        params,
      });
  
      // Log serial: Received response from Rainforest API
      console.log("Received response from Rainforest API", response.data);
  
      if (!response.data || !response.data.product) {
        // Log serial: Product not found in the response
        console.log("Product not found from Amazon");
        throw new Error("Product not found from Amazon");
      }
  
      // Extract the product from the response
      const amazonProduct = response.data.product;
  
      // Log serial: Calling saveProductToDatabase to save product
      console.log("Saving product to the database", amazonProduct);
  
      // Call the saveProductToDatabase function to save the product to the database
      const savedProduct = await saveProductToDatabase(amazonProduct);
  
      // Log serial: Successfully saved product to the database
      console.log("Successfully saved product to the database");
  
      return savedProduct;
    } catch (error) {
      // Log serial: Error occurred during product fetch/save
      console.error("Error fetching product from Amazon:", error.message);
      throw error;
    }
  };
  



  const fetchAndSaveProduct = async (req, res) => {
    const { asin } = req.params;
  
    // Log serial 1: Start of the function
    console.log("1. Function fetchAndSaveProduct started");
  
    if (!asin) {
      // Log serial 2: ASIN is missing
      console.log("2. ASIN is required but not provided");
  
      return res.status(400).json({
        success: false,
        message: "ASIN is required",
      });
    }
  
    try {
      // Log serial 3: Checking if the product exists in the database
      console.log("3. Checking if the product exists in the database");
  
      // Check if the product already exists in the database
      let product = await AmazonProduct.findOne({ "product.asin": asin });

      if (!product) {
              // If the product is not found in the database, fetch it from Amazon and save it
      product = await fetchProductFromAmazon(asin);
      return res.status(200).json({
        success: true,
        message: "This product is not found in the database, fetch it from Amazon and save it",
    
      });
      }
  
      if (product) {
        // Log serial 4: Product found in the database
        console.log("4. Product found in the database");
  
        return res.status(200).json({
          success: true,
          message: "This data is from the local database",
          amazonProduct: product,
        });
      }
  

  
   
    } catch (error) {
      // Log serial 10: Error occurred during the process
      console.error("10. Error fetching and saving product:", error);
  
      return res.status(500).json({
        success: false,
        message: "Failed to fetch and save product",
      });
    }
  };
  