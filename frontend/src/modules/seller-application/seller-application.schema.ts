import { z } from "zod/v4";

export const sellerApplicationSchema = z.object({
  store_name: z.string().trim().min(2, "Mağaza adı en az 2 karakter olmalıdır").max(180),
  contact_phone: z.string().trim().min(10, "Geçerli bir telefon numarası giriniz").max(50),
  note: z.string().trim().max(2000, "Açıklama en fazla 2000 karakter olabilir").optional(),
});

export type SellerApplicationInput = z.infer<typeof sellerApplicationSchema>;
