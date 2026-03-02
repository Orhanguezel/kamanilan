import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";

export default function HesabimPage() {
  redirect(ROUTES.PROFILE_INFO);
}
