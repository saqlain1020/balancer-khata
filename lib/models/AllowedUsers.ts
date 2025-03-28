import mongoose, { Model, Document } from "mongoose";

export interface IAllowedUser extends Document {
  email: string;
  _id: string;
}

const allowedUserSchema = new mongoose.Schema<IAllowedUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
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

const AllowedUser: Model<IAllowedUser> =
  mongoose.models.AllowedUser || mongoose.model<IAllowedUser>("AllowedUser", allowedUserSchema);

export default AllowedUser;
