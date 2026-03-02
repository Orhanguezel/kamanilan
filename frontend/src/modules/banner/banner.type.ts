/** Backend (/api/banners) banner modeli */
export interface BannerItem {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  thumbnail: string | null;
  alt: string | null;
  background_color: string | null;
  title_color: string | null;
  description_color: string | null;
  button_text: string | null;
  button_color: string | null;
  button_hover_color: string | null;
  button_text_color: string | null;
  link_url: string | null;
  link_target: string;
  order: number;
  /** Ana sayfadaki satır numarası (1/2/3). 0 = ana sayfada yok. */
  desktop_row: number;
  /** O satırdaki sütun sayısı (1=tam, 2=yarım, 3=üçte bir) */
  desktop_columns: number;
}
