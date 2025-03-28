"use server";
import { revalidatePath } from "next/cache";
import Expense from "../../../lib/models/Expense";
import { auth } from "auth";
import Customer from "../../../lib/models/Customer";
import { redirect } from "next/navigation";
import { serialize } from "src/utils/common";
import { Types } from "mongoose";

export async function addExpense(prev: any, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("User not found");
  }
  const reason = formData.get("reason");
  const type = formData.get("type");
  const date = formData.get("date");
  const amount = formData.get("amount");
  const customer = formData.get("customer");

  const customerDoc = await Customer.findById(customer);
  if (!customerDoc) {
    throw new Error("Customer not found");
  }
  if (customerDoc.user.toString() !== userId) {
    throw new Error("Customer not found");
  }
  const expense = new Expense({ reason, type, date, amount, customer: customerDoc });
  await expense.save();

  // @ts-expect-error
  await calculateCustomerBalance(customer);

  // revalidatePath(`/customer/${customer}`);
  redirect(`/customers/${customer}`);
}

export async function deleteExpense(prev: any, id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("User not found");
  }
  const expense = await Expense.findById(id).populate("customer");
  if (!expense) {
    throw new Error("Expense not found");
  }

  if ((expense.customer as any).user.toString() !== userId) {
    throw new Error("Expense not found");
  }

  await expense.deleteOne();
  // @ts-expect-error
  await calculateCustomerBalance(expense.customer.id.toString());
  // revalidatePath(`/customer/${expense.customer}`);
}

export async function getExpenses(customerId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("User not found");
  }
  const expenses = await Expense.find({ customer: customerId }).populate("customer");

  return serialize(expenses);
}

export async function calculateCustomerBalance(customerId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("User not found");
  }
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new Error("Customer not found");
  }
  if (customer.user.toString() !== userId) {
    throw new Error("Customer not found");
  }
  const aggregate = await Expense.aggregate([
    { $match: { customer: new Types.ObjectId(customerId) } },
    {
      $group: {
        _id: null,
        balance: {
          $sum: {
            $cond: [{ $eq: ["$type", "sent"] }, "$amount", { $multiply: ["$amount", -1] }],
          },
        },
      },
    },
  ]);

  const balance = aggregate[0]?.balance || 0;
  await Customer.findByIdAndUpdate(customerId, { balance }, { new: true });
  revalidatePath(`/`, "layout");
}
