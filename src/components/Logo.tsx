import { PawPrint } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link className={`logo ${light ? "logo--light" : ""}`} href="/" aria-label="PawCare home">
      <span className="logo__mark"><PawPrint weight="fill" aria-hidden="true" /></span>
      <span>Paw<span>Care</span></span>
    </Link>
  );
}
