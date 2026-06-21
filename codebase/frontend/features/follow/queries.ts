"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store";
import {
  fetchFollowing,
  fetchFollowingFeed,
  followUser,
  unfollowUser,
} from "./api";

export const followKeys = {
  following: ["follows"] as const,
  feed: ["follows", "feed"] as const,
};

function useAuthed() {
  return Boolean(useAuthStore((s) => s.token));
}

/** Returns the set of followed user ids for quick membership checks. */
export function useFollowingIds() {
  const query = useQuery({
    queryKey: followKeys.following,
    queryFn: fetchFollowing,
    enabled: useAuthed(),
    staleTime: 60 * 1000,
  });
  const ids = new Set((query.data ?? []).map((u) => u.id));
  return { ...query, ids };
}

export function useFollowingFeed() {
  return useQuery({
    queryKey: followKeys.feed,
    queryFn: fetchFollowingFeed,
    enabled: useAuthed(),
    staleTime: 60 * 1000,
  });
}

export function useFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => followUser(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: followKeys.following });
      qc.invalidateQueries({ queryKey: followKeys.feed });
    },
  });
}

export function useUnfollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => unfollowUser(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: followKeys.following });
      qc.invalidateQueries({ queryKey: followKeys.feed });
    },
  });
}
