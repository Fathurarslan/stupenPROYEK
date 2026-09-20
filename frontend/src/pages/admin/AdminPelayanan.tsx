import { useState } from "react";
import Layanan from "../../components/Layanan";

export default function Pelayanan() {
  const [kata, setKata] = useState("");
  return <Layanan kata={kata} setKata={setKata} />;
}
