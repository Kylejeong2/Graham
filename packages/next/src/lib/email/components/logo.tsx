import { Img } from "@react-email/components";

export function Logo() {
  return (
    <Img
      src={`/logo/graham-logo.png`}
      alt="Logo"
      className="my-0 mx-auto text-center"
      width={70}
      height={70}
    />
  );
}