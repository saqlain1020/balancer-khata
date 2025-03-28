"use server";
import { revalidatePath } from "next/cache";
import Customer from "../../../lib/models/Customer";
import { auth } from "auth";
import { redirect } from "next/navigation";
import { serialize } from "src/utils/common";

export async function addCustomer(prev: any, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("User not found");
  }
  const name = formData.get("name");
  const phone = formData.get("phone");
  const customer = new Customer({ name, phone, user: userId });
  await customer.save();
  revalidatePath("/");
  redirect("/");
}

export async function getCustomers() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("User not found");
  }
  const customers = await Customer.find({ user: userId });
  return serialize(customers);
}

export async function getCustomer(customerId: string) {
  const customer = await Customer.findById(customerId);
  return serialize(customer);
}
