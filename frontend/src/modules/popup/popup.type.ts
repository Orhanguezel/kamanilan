/** Backend /api/popups response item */
export interface PopupItem {
  id:                 number;
  type:               "topbar" | "sidebar_top" | "sidebar_center" | "sidebar_bottom";
  title:              string;
  content:            string | null;
  image:              string | null;
  alt:                string | null;
  background_color:   string | null;
  text_color:         string | null;
  button_text:        string | null;
  button_color:       string | null;
  button_hover_color: string | null;
  button_text_color:  string | null;
  link_url:           string | null;
  link_target:        string;
  text_behavior:      "static" | "marquee";
  scroll_speed:       number;
  closeable:          boolean;
  delay_seconds:      number;
  display_frequency:  "always" | "once" | "daily";
  order:              number;
}
