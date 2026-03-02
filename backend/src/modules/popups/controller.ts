// =============================================================
// FILE: src/modules/popups/controller.ts  — Public
// =============================================================
import type { FastifyRequest, FastifyReply } from "fastify";
import { repoListPublic } from "./repository";
import { publicListQuerySchema } from "./validation";
import type { PopupRow } from "./schema";

type PopupData = {
  id:        number;
  type:      string;
  title:     string;
  content:   string | null;
  image:     string | null;
  alt:       string | null;
  background_color:   string | null;
  text_color:         string | null;
  button_text:        string | null;
  button_color:       string | null;
  button_hover_color: string | null;
  button_text_color:  string | null;
  link_url:           string | null;
  link_target:        string;
  text_behavior:      string;
  scroll_speed:       number;
  closeable:          boolean;
  delay_seconds:      number;
  display_frequency:  string;
  order:              number;
};

function rowToPublic(row: PopupRow, imageUrl: string | null): PopupData {
  return {
    id:                 row.id,
    type:               row.type,
    title:              row.title,
    content:            row.content ?? null,
    image:              imageUrl,
    alt:                row.alt ?? null,
    background_color:   row.background_color ?? null,
    text_color:         row.text_color ?? null,
    button_text:        row.button_text ?? null,
    button_color:       row.button_color ?? null,
    button_hover_color: row.button_hover_color ?? null,
    button_text_color:  row.button_text_color ?? null,
    link_url:           row.link_url ?? null,
    link_target:        row.link_target,
    text_behavior:      row.text_behavior,
    scroll_speed:       row.scroll_speed,
    closeable:          row.closeable === 1,
    delay_seconds:      row.delay_seconds,
    display_frequency:  row.display_frequency,
    order:              row.display_order,
  };
}

export async function listPopups(req: FastifyRequest, reply: FastifyReply) {
  const q = publicListQuerySchema.parse(req.query);
  const rows = await repoListPublic(q);
  return reply.send(rows.map((r) => rowToPublic(r.row, r.image_url)));
}
