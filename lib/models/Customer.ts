import mongoose, { Model, Document } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  phone: string;
  balance: number;
  _id: string;
  user: mongoose.Schema.Types.ObjectId;
}

const customerSchema = new mongoose.Schema<ICustomer>(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
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

// Create unique compound index on name and user fields
customerSchema.index({ name: 1, user: 1 }, { unique: true });

const Customer: Model<ICustomer> = mongoose.models.Customer || mongoose.model<ICustomer>("Customer", customerSchema);

export default Customer;
