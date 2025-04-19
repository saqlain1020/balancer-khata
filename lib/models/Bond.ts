import mongoose, { Model, Document } from "mongoose";

export interface IBondCategory {
  name: string;
  bonds: number[];
}

export interface IBond extends Document {
  customer: string; // Unique customer name
  user: mongoose.Schema.Types.ObjectId;
  categories: IBondCategory[];
  _id: string;
}

const bondCategorySchema = new mongoose.Schema<IBondCategory>({
  name: {
    type: String,
    required: true,
  },
  bonds: {
    type: [Number],
    default: [],
  },
});

const bondSchema = new mongoose.Schema<IBond>(
  {
    customer: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categories: {
      type: [bondCategorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    virtuals: true,
    strict: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Create unique compound index on customer name and user fields
bondSchema.index({ customer: 1, user: 1 }, { unique: true });

const Bond: Model<IBond> = mongoose.models.Bond || mongoose.model<IBond>("Bond", bondSchema);

export default Bond;
