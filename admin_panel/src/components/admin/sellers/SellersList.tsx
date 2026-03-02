import * as Mod from '@/app/(main)/admin/(admin)/sellers/_components/admin-sellers-client';
const AnyMod = Mod as any;
const C = AnyMod.default ?? AnyMod.AdminSellersClient;
export const SellersList = AnyMod.AdminSellersClient ?? C;
export default C;
export * from '@/app/(main)/admin/(admin)/sellers/_components/admin-sellers-client';
