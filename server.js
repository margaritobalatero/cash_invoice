// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(
  "mongodb+srv://junjie:junjiexx@junjiecluster.1cawbvg.mongodb.net/cash_invoicee?retryWrites=true&w=majority&appName=invoice_cash"
);

const InvoiceSchema = new mongoose.Schema({
  customerName: String,
  items: [
    {
      description: String,
      qty: Number,
      price: Number
    }
  ],
  total: Number,
  createdAt: { type: Date, default: Date.now }
});

const Invoice = mongoose.model("Invoice", InvoiceSchema);

// CREATE
app.post("/api/invoices", async (req, res) => {
  const invoice = await Invoice.create(req.body);
  res.json(invoice);
});

// READ ALL
app.get("/api/invoices", async (req, res) => {
  res.json(await Invoice.find().sort({ createdAt: -1 }));
});

// READ ONE
app.get("/api/invoices/:id", async (req, res) => {
  res.json(await Invoice.findById(req.params.id));
});

// UPDATE (EDIT) — STABLE
app.put("/api/invoices/:id", async (req, res) => {
  const updated = await Invoice.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

// DELETE
app.delete("/api/invoices/:id", async (req, res) => {
  await Invoice.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.listen(3000, () => console.log("Server running on port 3000"));
