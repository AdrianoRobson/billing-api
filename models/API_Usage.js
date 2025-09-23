const mongoose = require("../db/connect");

const { Schema } = mongoose;

const apiUsage = new Schema(
  {
    companyId: {
      type: String,
      required: true,
    },
    callerId: {
      type: String,
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    product: {
      type: String,
      required: true,
    },
    usage: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    billingBy: {
      type: String,
      required: true,
    },
    billingUnit: {
      type: Number,
      required: true,
    },
    total_cost: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      enum: ["text", "audio", "image", "video"],
    },
    usedTo: {
      type: String,
      enum: ["stt", "llm", "tts"],
    },
  },
  { timestamps: true }
);

const API_Usage = mongoose.model("API_Usage", apiUsage);

module.exports = API_Usage;
