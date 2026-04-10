import mongoose, { Schema } from "mongoose";

const emailOtpSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    purpose: { type: String, enum: ["registration"], required: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

emailOtpSchema.index({ email: 1, purpose: 1 }, { unique: true });

export const EmailOtp = mongoose.models.EmailOtp || mongoose.model("EmailOtp", emailOtpSchema);
