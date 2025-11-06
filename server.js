const express = require("express");
const { z } = require("zod"); // Import Zod for validation

// --- Constants ---
// Define "magic" strings in one place
const MIGRATION_STATUS_SUCCESS = "3";
const API_REQUEST_STATUS_OK = "0";
const API_REQUEST_STATUS_FAILED = "1";

// --- App Setup ---
const app = express();
const port = process.env.PORT || 3000; // Use environment variable for port

// --- Middleware ---
app.use(express.json()); // Middleware to parse JSON body

// --- Validation Schema ---
// Define the "shape" of a valid request body using Zod
const migrationSchema = z.object({
  corporateId: z.string({ required_error: "corporateId is required" }).min(1),
  userId: z.string({ required_error: "userId is required" }).min(1),
  updatedBy: z.string({ required_error: "updatedBy is required" }).min(1),
  migrationStatus: z.string({ required_error: "migrationStatus is required" }).min(1),
});

// --- Routes ---
app.post("/CXO2CM", (req, res) => {
  try {
    // 1. VALIDATE the request body
    // safeParse won't throw an error; it returns a success object
    const validation = migrationSchema.safeParse(req.body);

    if (!validation.success) {
      // If validation fails, send a 400 Bad Request
      return res.status(400).json({
        requestStatus: API_REQUEST_STATUS_FAILED,
        errorReason: "Validation failed",
        errors: validation.error.flatten().fieldErrors, // Shows details of what failed
      });
    }

    // 2. BUSINESS LOGIC (using validated data)
    // We now know validation.data contains all our fields
    const { corporateId, userId, migrationStatus } = validation.data;

    if (migrationStatus === MIGRATION_STATUS_SUCCESS) {
      // Success response (HTTP 200)
      return res.status(200).json({
        corporateId: corporateId,
        userId: userId,
        requestStatus: API_REQUEST_STATUS_OK,
        errorReason: "",
      });
    } else {
      // Business logic "failure" response (HTTP 422)
      return res.status(422).json({
        corporateId: corporateId,
        userId: userId,
        requestStatus: API_REQUEST_STATUS_FAILED,
        errorReason: "Update status gagal",
      });
    }
  } catch (error) {
    // 3. UNEXPECTED ERROR HANDLER
    // If anything else goes wrong, send a 500
    console.error("Unexpected error:", error); // Log the error for debugging
    return res.status(500).json({
      requestStatus: API_REQUEST_STATUS_FAILED,
      errorReason: "Internal Server Error",
    });
  }
});

module.exports = app;

// --- Server Start ---
//app.listen(port, () => {
//  console.log(`🚀 Server running at http://localhost:${port}`);
//});