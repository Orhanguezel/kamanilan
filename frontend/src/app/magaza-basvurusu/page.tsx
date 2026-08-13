import type { Metadata } from "next";

import { SellerApplicationClient } from "./seller-application-client";

export const metadata: Metadata = {
  title: "Mağaza Başvurusu | Kaman İlan",
  description: "Kaman İlan satıcı mağazası için başvuru oluşturun.",
};

export default function SellerApplicationPage() {
  return <SellerApplicationClient />;
}
