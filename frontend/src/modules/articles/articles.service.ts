"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";

import { getApiBaseUrl } from "@/lib/api-url";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import type { Article, ArticleListParams, ArticleComment, ArticleLikes } from "./articles.types";

const publicApi = axios.create({ baseURL: getApiBaseUrl(), timeout: 15_000 });

function authHeaders() {
  const token = Cookies.get(AUTH_TOKEN_KEY) || "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ─── Queries ─────────────────────────────────────────────────── */

export function useArticlesQuery(params: ArticleListParams = {}) {
  return useQuery<Article[]>({
    queryKey: ["articles", params],
    queryFn: async () => {
      const res = await publicApi.get<Article[]>("/articles", { params });
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useArticleBySlugQuery(slug: string) {
  return useQuery<Article>({
    queryKey: ["article", slug],
    queryFn: async () => {
      const res = await publicApi.get<Article>(`/articles/${encodeURIComponent(slug)}`);
      return res.data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useArticleCommentsQuery(slug: string, enabled = true) {
  return useQuery<ArticleComment[]>({
    queryKey: ["article-comments", slug],
    queryFn: async () => {
      const res = await publicApi.get<ArticleComment[]>(`/articles/${encodeURIComponent(slug)}/comments`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!slug && enabled,
    staleTime: 1000 * 60 * 2,
  });
}

export function useArticleLikesQuery(slug: string) {
  return useQuery<ArticleLikes>({
    queryKey: ["article-likes", slug],
    queryFn: async () => {
      const res = await publicApi.get<ArticleLikes>(`/articles/${encodeURIComponent(slug)}/likes`);
      return res.data;
    },
    enabled: !!slug,
    staleTime: 1000 * 30,
  });
}

/* ─── Mutations ───────────────────────────────────────────────── */

export function useCreateCommentMutation(slug: string) {
  const qc = useQueryClient();
  return useMutation<ArticleComment, Error, { content: string }>({
    mutationFn: async ({ content }) => {
      const res = await publicApi.post<ArticleComment>(
        `/articles/${encodeURIComponent(slug)}/comments`,
        { content },
        { headers: authHeaders() },
      );
      return res.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["article-comments", slug] });
    },
  });
}

export function useToggleLikeMutation(slug: string) {
  const qc = useQueryClient();
  return useMutation<ArticleLikes, Error, void>({
    mutationFn: async () => {
      const res = await publicApi.post<ArticleLikes>(
        `/articles/${encodeURIComponent(slug)}/like`,
        {},
        { headers: authHeaders() },
      );
      return res.data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["article-likes", slug], data);
    },
  });
}
