import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { createUser, updateUser, deleteUser } from "@/lib/actions/user.action";

export async function POST(req: NextRequest) {
  try {

    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error(
        "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
      );
    }

    const event = await verifyWebhook(req, { signingSecret: WEBHOOK_SECRET });

    const { type, data } = event;

    // CREATE
    if (type === "user.created") {
      const { id, email_addresses, image_url, first_name, last_name, username } = data;

      const user = {
        clerkId: id,
        email: email_addresses?.[0]?.email_address || "",
        username: username ?? "",
        firstName: first_name ?? "",
        lastName: last_name ?? "",
        photo: image_url ?? "",
      };

      const newUser = await createUser(user);

      if (newUser) {
        // eslint-disable-next-line
        (await (clerkClient as any).users.updateUserMetadata(id, {
          publicMetadata: {
            userId: newUser._id,
          },
        }));
      }

      return NextResponse.json({ message: "User created", user: newUser });
    }

    // UPDATE
    if (type === "user.updated") {
      const { id, image_url, first_name, last_name, username } = data;

      const user = {
        firstName: first_name ?? "",
        lastName: last_name ?? "",
        username: username ?? "",
        photo: image_url ?? "",
      };

      const updatedUser = await updateUser(id, user);

      return NextResponse.json({ message: "User updated", user: updatedUser });
    }

    // DELETE
    if (type === "user.deleted") {
      const { id } = data;

      const deletedUser = await deleteUser(id!);

      return NextResponse.json({ message: "User deleted", user: deletedUser });
    }

    // Log and ignore other event types
    console.log(`Unhandled Clerk event: ${type}`);
    return NextResponse.json({ message: "Event ignored" });
  } catch (err) {
    console.error("Error handling Clerk webhook:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }
}
