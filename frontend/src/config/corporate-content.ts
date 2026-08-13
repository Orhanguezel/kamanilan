export const LEGACY_CORPORATE_REDIRECTS = [
  { source: "/misyon-vizyon", destination: "/hakkimizda", permanent: true },
  {
    source: "/kalite-politikamiz",
    destination: "/hakkimizda",
    permanent: true,
  },
] as const;

export const QUALITY_PRINCIPLES = [
  {
    title: "Güvenilirlik",
    description:
      "İlanların anlaşılır, güncel ve kullanıcılar için güvenli biçimde sunulmasını gözetiriz.",
  },
  {
    title: "Şeffaflık",
    description:
      "İlan sahibiyle alıcı arasındaki iletişimi açık tutar, yanıltıcı içeriklere izin vermeyiz.",
  },
  {
    title: "Yerel fayda",
    description:
      "Kaman ve Kırşehir ekonomisini güçlendiren üretici, esnaf ve bireysel kullanıcıları destekleriz.",
  },
  {
    title: "Sürekli iyileştirme",
    description:
      "Platformu kullanıcı geri bildirimleri, erişilebilirlik ve performans ölçümleriyle geliştiririz.",
  },
] as const;
