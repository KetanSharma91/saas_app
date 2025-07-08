import { clerkClient } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.action";

type ClerkEvent = {
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
    username?: string;
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
  type: string;
};

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get Svix headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");


  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Now svix_* are string


  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: ClerkEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkEvent;
  } catch (err) {
    console.error("❌ Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const eventType = evt.type;

  switch (eventType) {
    case "user.created": {
      const data = evt.data;
      const user = {
        clerkId: data.id,
        email: data.email_addresses?.[0]?.email_address ?? "",
        username: data.username ?? "",
        firstName: data.first_name ?? "",
        lastName: data.last_name ?? "",
        photo: data.image_url ?? "",
      };

      const newUser = await createUser(user);

      if (newUser) {
        const client = await clerkClient();


        await client.users.updateUserMetadata(data.id, {
          publicMetadata: {
            userId: newUser._id,
          },
        });
      }

      return NextResponse.json({ message: "OK", user: newUser });
    }

    case "user.updated": {
      const data = evt.data;

      const user = {
        firstName: data.first_name ?? "",
        lastName: data.last_name ?? "",
        username: data.username ?? "",
        photo: data.image_url ?? "",
      };

      const updatedUser = await updateUser(data.id, user);

      return NextResponse.json({ message: "OK", user: updatedUser });
    }

    case "user.deleted": {
      const data = evt.data;

      const deletedUser = await deleteUser(data.id);

      return NextResponse.json({ message: "OK", user: deletedUser });
    }

    default:
      console.log(`ℹ️ Received unhandled event type: ${eventType}`);
      return new Response("Event type not handled", { status: 200 });
  }
}
