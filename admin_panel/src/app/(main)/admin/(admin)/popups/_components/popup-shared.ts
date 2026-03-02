import type { PopupAdminCreateBody } from '@/integrations/shared';

export type PopupFormState = PopupAdminCreateBody;

export const emptyPopupForm: PopupFormState = {
  title: '',
  content: '',
  image_url: '',
  image_asset_id: '',
  image_alt: '',
  button_text: '',
  button_link: '',
  is_active: true,
  display_frequency: 'always',
  delay_seconds: 0,
  start_date: null,
  end_date: null,
  services_id: null,
  display_pages: 'all',
  priority: null,
  duration_seconds: null,
};

export const txt = (v: unknown, fallback: string) => {
  const s = String(v ?? '').trim();
  return s || fallback;
};
