const AmazonProduct = require("../models/AmazonProduct");

// Approve the product
exports.getProducts = async (req, res) => {
  try {
    const { status = "All", page = 1, limit = 10 } = req.query;
    console.log(status);
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Validate page and limit
    if (pageNumber < 1 || limitNumber < 1) {
      return res.status(400).json({ message: "Invalid page or limit" });
    }

    // Build the query
    const query = {};
    if (status !== "All") {
      query.status = status;
    }

    // Get the products with pagination
    const products = await AmazonProduct.find(query)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    // Get the total count of products for pagination
    const totalCount = await AmazonProduct.countDocuments(query).exec();

    // Respond with products and pagination info
    res.json({
      totalCount,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber,
      products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve the product
exports.approveProduct = async (req, res) => {
  try {
    // Attempt to find and update the product
    const product = await AmazonProduct.findByIdAndUpdate(
      req.params.id,
      { status: "Approve" },
      { new: true }
    );

    // Log the result of the findByIdAndUpdate operation
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Return the updated product
    res.json(product);
  } catch (error) {
    // Log the error message
    console.error("Error in approveProduct:", error.message);
    res.status(500).json({ message: error.message });
  }
};


exports.editProduct = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  console.log("updateData",updateData.title);

  // Basic validation
  if (!updateData || typeof updateData !== 'object') {
    return res.status(400).json({ message: "Invalid update data" });
  }

  try {
    // Find and update the product
    const updatedProduct = await AmazonProduct.findByIdAndUpdate(
      id,
      { $set: { product: updateData, status: "Edit" } },
      { new: true, runValidators: true } // Ensure schema validation runs on update
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, error); // Log the error
    res.status(500).json({ message: "An error occurred while updating the product" });
  }
};


// Fix the product
exports.fixProduct = async (req, res) => {
  try {
    const product = await AmazonProduct.findByIdAndUpdate(
      req.params.id,
      { status: "Fix" },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Draft the product
exports.draftProduct = async (req, res) => {
  try {
    const product = await AmazonProduct.findByIdAndUpdate(
      req.params.id,
      { status: "Draft" },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark the product as duplicate
exports.duplicateProduct = async (req, res) => {
  try {
    const product = await AmazonProduct.findByIdAndUpdate(
      req.params.id,
      { status: "Duplicate" },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Delete the product
exports.deleteProduct = async (req, res) => {
  const { asin } = req.params; // Ensure asin is coming from the request parameters or body
  console.log("Received request to delete product with ASIN:", asin); // Log asin to debug

  try {
    // Check if the product exists with the given ASIN
    let product = await AmazonProduct.findOne({ "product.asin": asin });

    if (!product) {
      console.log("Product not found for ASIN:", asin); // Log when product is not found
      return res.status(404).json({ message: "Product not found" });
    }

    // If the product exists, delete it
    await AmazonProduct.deleteOne({ "product.asin": asin });
    console.log("Product deleted successfully for ASIN:", asin); // Log successful deletion

    // Send success response
    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error while deleting product:", error.message); // Log the error for debugging
    return res.status(500).json({ message: error.message });
  }
};

