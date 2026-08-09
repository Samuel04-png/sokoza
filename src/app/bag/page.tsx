import { permanentRedirect } from "next/navigation";

export default function PreviousCartRoute() {
  permanentRedirect("/cart");
}
