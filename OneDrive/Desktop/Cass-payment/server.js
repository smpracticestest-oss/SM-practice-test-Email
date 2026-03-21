import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_ENV = process.env.CASHFREE_ENV || "SANDBOX"; // SANDBOX / PRODUCTION

const CASHFREE_BASE_URL =
  CASHFREE_ENV === "PRODUCTION"
    ? "https://api.cashfree.com"
    : "https://sandbox.cashfree.com";

/**
 * Verify Cashfree payment using Order ID
 */
app.post("/verify-payment", async (req, res) => {
  const { order_id } = req.body;

  if (!order_id) {
    return res.status(400).json({ success: false, message: "Order ID missing" });
  }

  try {
    const response = await fetch(
      `${CASHFREE_BASE_URL}/pg/orders/${order_id}`,
      {
        method: "GET",
        headers: {
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "x-api-version": "2023-08-01"
        }
      }
    );

    const data = await response.json();

    if (
      data.order_status === "PAID"
    ) {
      res.json({ success: true, order: data });
    } else {
      res.status(400).json({ success: false, order: data });
    }

  } catch (error) {
    console.error("Cashfree verification error:", error);
    res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
