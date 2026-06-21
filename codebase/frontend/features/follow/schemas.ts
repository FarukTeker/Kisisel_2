import { z } from "zod";
import { discoverNewspaperSchema } from "@/features/dashboard/schemas";

export const followedUserSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export const followingListSchema = z.object({
  following: z.array(followedUserSchema),
});

/** A following-feed card = a discover card + when it was shared. */
export const followingFeedItemSchema = discoverNewspaperSchema.extend({
  createdAt: z.string(),
});
export const followingFeedSchema = z.object({
  newspapers: z.array(followingFeedItemSchema),
});

export type FollowedUser = z.infer<typeof followedUserSchema>;
export type FollowingFeedItem = z.infer<typeof followingFeedItemSchema>;
