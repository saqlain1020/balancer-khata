"use server";

import { revalidatePath } from "next/cache";
import Bond, { IBond, IBondCategory } from "../../../lib/models/Bond";
import { auth } from "auth";
import { redirect } from "next/navigation";
import { serialize } from "src/utils/common";
import Customer from "../../../lib/models/Customer";

// Get all bonds for the current user
export async function getBonds() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("User not found");
  }
  const bonds = await Bond.find({ user: userId });
  return serialize(bonds);
}

// Get a single bond by ID
export async function getBond(bondId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("User not found");
  }
  const bond = await Bond.findById(bondId);
  if (!bond || bond.user.toString() !== userId) {
    throw new Error("Bond not found");
  }
  return serialize(bond);
}

// Get bond by customer name
export async function getBondByCustomer(customerName: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("User not found");
  }
  const bond = await Bond.findOne({ user: userId, customer: customerName });
  return serialize(bond);
}

// Add new bond
export async function addBond(data: { customer: string; categories: IBondCategory[] }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("User not found");
  }

  try {
    // Check if this customer already has bonds
    const existingBond = await Bond.findOne({ user: userId, customer: data.customer });
    if (existingBond) {
      throw new Error("Bond for this customer already exists. Please edit instead.");
    }

    const bond = new Bond({
      customer: data.customer,
      categories: data.categories,
      user: userId,
    });
    await bond.save();
    revalidatePath("/bonds");
    return { success: true, bond: serialize(bond) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Update an existing bond
export async function updateBond(bondId: string, data: { customer: string; categories: IBondCategory[] }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("User not found");
  }

  try {
    const bond = await Bond.findById(bondId);
    if (!bond || bond.user.toString() !== userId) {
      throw new Error("Bond not found");
    }

    // Check if changing customer name would create a duplicate
    if (bond.customer !== data.customer) {
      const existingBond = await Bond.findOne({
        user: userId,
        customer: data.customer,
        _id: { $ne: bondId },
      });
      if (existingBond) {
        throw new Error("Bond for this customer already exists");
      }
    }

    bond.customer = data.customer;
    bond.categories = data.categories;
    await bond.save();

    revalidatePath("/bonds");
    return { success: true, bond: serialize(bond) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Delete a bond
export async function deleteBond(bondId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("User not found");
  }

  try {
    const bond = await Bond.findById(bondId);
    if (!bond || bond.user.toString() !== userId) {
      throw new Error("Bond not found");
    }

    await Bond.findByIdAndDelete(bondId);
    revalidatePath("/bonds");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get list of all customer names (for autocomplete)
export async function getCustomerNames() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("User not found");
  }

  // Get names from both Bond and Customer models
  const bonds = await Bond.find({ user: userId }, { customer: 1 });
  const customers = await Customer.find({ user: userId }, { name: 1 });

  // Combine unique names
  const bondCustomers = bonds.map((bond) => bond.customer);
  const customerNames = customers.map((customer) => customer.name);

  // Use Set to ensure uniqueness
  const uniqueNamesSet = new Set([...bondCustomers, ...customerNames]);
  const uniqueNames = Array.from(uniqueNamesSet);

  return uniqueNames;
}

// Get list of all category names used (for autocomplete)
export async function getCategoryNames() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("User not found");
  }

  const bonds = await Bond.find({ user: userId });

  // Extract and flatten all category names
  const categoryNames = bonds.flatMap((bond) => bond.categories.map((category) => category.name));

  // Use Set to ensure uniqueness
  const uniqueNamesSet = new Set(categoryNames);
  const uniqueNames = Array.from(uniqueNamesSet);

  return uniqueNames;
}
