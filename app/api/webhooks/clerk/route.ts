import { clerkClient } from "@clerk/nextjs/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.action";

export async function POST(req: Request) {
  // const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  const WEBHOOK_SECRET = "whsec_/LLeVSP/1nqO+UWGkoirGcBYjci9TyJd"

  console.log('WEBHOOK_SECRET', WEBHOOK_SECRET);

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  let headerPayload;
  let svix_id: string | null;
  let svix_timestamp: string | null;
  let svix_signature: string | null;

  try {
    headerPayload = await headers();
    svix_id = headerPayload.get("svix-id");
    svix_timestamp = headerPayload.get("svix-timestamp");
    svix_signature = headerPayload.get("svix-signature");
  } catch (err) {
    console.error("Error retrieving headers:", err);
    return NextResponse.json({ error: "Error retrieving headers" }, { status: 400 });
  }

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing Svix headers" }, { status: 400 });
  }

  let payload;
  let body: string;

  try {
    payload = await req.json();
    body = JSON.stringify(payload);
  } catch (err) {
    console.error("Error parsing request body:", err);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  try {
    // CREATE
    if (eventType === "user.created") {
      const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

      const user = {
        clerkId: id,
        email: email_addresses?.[0]?.email_address || "",
        username: username ?? "user",
        firstName: first_name ?? "",
        lastName: last_name ?? "",
        photo: image_url ?? "",
      };

      let newUser;
      try {
        newUser = await createUser(user);
      } catch (err) {
        console.error("Error creating user in DB:", err);
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
      }

      if (newUser) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (clerkClient as any).users.updateUserMetadata(id, {
            publicMetadata: {
              userId: newUser._id,
            },
          });
        } catch (err) {
          console.error("Error updating Clerk user metadata:", err);
        }
      }

      return NextResponse.json({ message: "User created", user: newUser });
    }

    // UPDATE
    if (eventType === "user.updated") {
      const { id, image_url, first_name, last_name, username } = evt.data;

      const user = {
        firstName: first_name ?? "",
        lastName: last_name ?? "",
        username: username ?? "",
        photo: image_url ?? "",
      };

      let updatedUser;
      try {
        updatedUser = await updateUser(id, user);
      } catch (err) {
        console.error("Error updating user:", err);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
      }

      return NextResponse.json({ message: "User updated", user: updatedUser });
    }

    // DELETE
    if (eventType === "user.deleted") {
      const { id } = evt.data;

      let deletedUser;
      try {
        deletedUser = await deleteUser(id!);
      } catch (err) {
        console.error("Error deleting user:", err);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
      }

      return NextResponse.json({ message: "User deleted", user: deletedUser });
    }

    // Unhandled event type
    console.log(`Unhandled Clerk event: ${eventType} | ID: ${id}`);
    console.log("Webhook body:", body);

    return NextResponse.json({ message: "Event ignored" }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error processing webhook:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}