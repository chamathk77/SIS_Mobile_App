import { Ionicons } from "@expo/vector-icons";
import { Notice, NoticeCategory } from "../type/notice";

const CATEGORY_COLORS: Record<string, string> = {
  event: "#0891b2",
  announcement: "#2563eb",
  academic: "#7c3aed",
  urgent: "#dc2626",
};

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  event: "calendar-outline",
  announcement: "megaphone-outline",
  academic: "school-outline",
  urgent: "alert-circle-outline",
};

export function formatNoticeCategory(category: NoticeCategory): string {
  if (!category) {
    return "Notice";
  }
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
}

export function getNoticeCategoryColor(category: NoticeCategory): string {
  return CATEGORY_COLORS[category] ?? "#64748b";
}

export function getNoticeCategoryIcon(
  category: NoticeCategory,
): keyof typeof Ionicons.glyphMap {
  return CATEGORY_ICONS[category] ?? "document-text-outline";
}

export function formatNoticeDate(iso: string): string {
  if (!iso?.trim()) {
    return "—";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNoticeAudience(audience: string): string {
  if (!audience) {
    return "All";
  }
  return audience.charAt(0).toUpperCase() + audience.slice(1).toLowerCase();
}

export function getAttachmentIcon(
  mimeType: string,
): keyof typeof Ionicons.glyphMap {
  if (mimeType.startsWith("image/")) {
    return "image-outline";
  }
  if (mimeType.includes("pdf")) {
    return "document-text-outline";
  }
  return "attach-outline";
}

export function sortNotices(notices: Notice[]): Notice[] {
  return [...notices].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) {
      return a.is_pinned ? -1 : 1;
    }
    return b.publish_at.localeCompare(a.publish_at);
  });
}
