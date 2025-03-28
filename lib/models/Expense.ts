import mongoose, { Model, Document } from "mongoose";
import Customer, { ICustomer } from "./Customer";

export interface IExpense extends Document {
  reason: string;
  date: Date;
  amount: number;
  type: ExpenseType;
  _id: string;
  customer: mongoose.Schema.Types.ObjectId;
}

export interface IExpensePopulated extends Omit<IExpense, "customer" | "user"> {
  customer: ICustomer;
}

export enum ExpenseType {
  SENT = "sent",
  RECEIVED = "received",
}

const expenseSchema = new mongoose.Schema<IExpense>(
  {
    reason: {
      type: String,
      required: false,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ExpenseType,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Customer,
      required: true,
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

const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>("Expense", expenseSchema);

export default Expense;
// // Add a pre find middleware to populate the referrer field
// productSchema.pre(/^find/, function (next) {
//   // @ts-ignore
//   this.populate("soldTo");
//   // @ts-ignore
//   this.populate("boughtFrom");
//   next();
// });
