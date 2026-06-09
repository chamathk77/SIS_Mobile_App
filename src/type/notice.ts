export type NoticeCategory =
  | "event"
  | "announcement"
  | "academic"
  | "urgent"
  | string;

export type NoticeAudience = "all" | "parents" | "students" | string;

export interface NoticeAttachment {
  id: number;
  filename: string;
  url: string;
  mime_type: string;
  size_bytes: number;
  human_size: string;
}

export interface NoticeReadState {
  is_read: boolean;
  read_at: string | null;
  acknowledged: boolean;
  acknowledged_at: string | null;
}

export interface Notice {
  id: number;
  title: string;
  body: string;
  category: NoticeCategory;
  audience: NoticeAudience;
  is_pinned: boolean;
  requires_acknowledgement: boolean;
  poster_url: string | null;
  publish_at: string;
  expires_at: string | null;
  attachments: NoticeAttachment[];
  read: NoticeReadState;
}

export interface NoticeMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface GetNoticesResponse {
  success: boolean;
  message: string;
  data: {
    student_id: number;
    unread_count: number;
    notices: Notice[];
    meta: NoticeMeta;
  };
}
