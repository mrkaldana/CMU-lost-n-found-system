import mongoose, { Schema, InferSchemaType } from "mongoose";

const activitySchema = new Schema(
  {
    id: { type: String, required: true },
    date: { type: String, required: true },
    action: { type: String, required: true },
    by: { type: String, required: true }
  },
  { _id: false }
);

const itemSchema = new Schema(
  {
    refId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "missing", "found", "surrendered", "claimed", "rejected"],
      default: "pending"
    },
    location: { type: String, required: true, trim: true },
    locationCoordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    dateLost: { type: String, required: true },
    dateReported: { type: String, required: true },
    reportedBy: { type: String, required: true, trim: true },
    reportedByName: { type: String, required: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    foundBy: { type: String },
    isFoundByAnonymous: { type: Boolean, default: false },
    dateResolved: { type: String },
    imageUrl: { type: String },
    activityLog: { type: [activitySchema], default: [] }
  },
  { timestamps: true }
);

itemSchema.index({ status: 1, category: 1, dateReported: -1 });
itemSchema.index({ reportedBy: 1, dateReported: -1 });
itemSchema.index({ createdAt: -1 });

export type ItemDoc = InferSchemaType<typeof itemSchema> & { _id: mongoose.Types.ObjectId };

export const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);

