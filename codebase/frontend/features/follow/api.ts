import { z } from "zod";
import { apiRequest } from "@/lib/api/client";
import {
  followingFeedSchema,
  followingListSchema,
  type FollowedUser,
  type FollowingFeedItem,
} from "./schemas";

const okSchema = z.object({ ok: z.boolean() });

export async function followUser(userId: string): Promise<void> {
  await apiRequest(`/follows/${userId}`, { method: "POST", schema: okSchema });
}

export async function unfollowUser(userId: string): Promise<void> {
  await apiRequest(`/follows/${userId}`, { method: "DELETE", schema: okSchema });
}

export async function fetchFollowing(): Promise<FollowedUser[]> {
  const data = await apiRequest("/follows", { schema: followingListSchema });
  return data.following;
}

export async function fetchFollowingFeed(): Promise<FollowingFeedItem[]> {
  const data = await apiRequest("/follows/feed", { schema: followingFeedSchema });
  return data.newspapers;
}
