"use server";

import { revalidatePath } from "next/cache";
import AllowedUser from "../../../lib/models/AllowedUsers";

export async function getAllowedUsers() {
  const items = await AllowedUser.find().select("email").lean();
  return items;
}

export async function addAllowedUser(formData: FormData) {
  const email = formData.get("email");
  const user = new AllowedUser({ email });
  await user.save();
  revalidatePath("/manage_users");
}

export async function deleteAllowedUser(formData: FormData) {
  const email = formData.get("email");
  await AllowedUser.deleteOne({ email });
  revalidatePath("/manage_users");
}
