import { PawPrint } from "@phosphor-icons/react/dist/ssr";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <a className={`logo ${light ? "logo--light" : ""}`} href="#home" aria-label="PawCare home">
      <span className="logo__mark"><PawPrint weight="fill" aria-hidden="true" /></span>
      <span>Paw<span>Care</span></span>
    </a>
  );
}
