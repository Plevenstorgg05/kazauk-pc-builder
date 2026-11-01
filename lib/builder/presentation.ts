import type { BuilderProduct } from "./types";
import { formatPounds } from "@/lib/pricing/currency";
/** Concise model labels for the selection UI. Full retailer titles remain in product details and exports. */
const labels: Record<string, string> = {
  "ssd-ssd-1tbadleg800p": "ADATA ALEG-800-1000GCS · 1 TB",
  "ssd-tm8fgm002t0c101": "Team Group NV5000 · 2 TB",
  "ssd-tm8fgm001t0c101": "Team Group NV5000 · 1 TB",
  "ssd-tm8fp6512g0c101": "Team Group MP33 · 512 GB",
  "ssd-tm8fp6001t0c101": "Team Group MP33 · 1 TB",
  "ssd-tm8ps7512g0c101": "Team Group MS30 · 512 GB",
  "ssd-t253x2512g0c101": "Team Group GX2 · 512 GB",
  "mouse-clutch-gm08": "MSI CLUTCH GM08",
  "mouse-g964w-bk": "Marvo Scorpion G964W Niro 60 (Black)",
  "mouse-ch-930f000-ww": "Corsair M55",
  "mouse-s12-4301440-cla": "MSI Versa 300 Wireless (White)",
  "keyboard-kg937": "Marvo Scorpion KG937 Arma 98 · UK",
  "keyboard-vigor-gk30": "MSI VIGOR GK30 · UK",
  "keyboard-k604-uk": "Marvo Scorpion K604 Soldat 20 · UK",
  "keyboard-kg933g-wh": "Marvo Scorpion KG933G Saber 61 · UK / White",
  "headset-hg9076w": "Marvo HG9076W Tactic X Pro (Black)",
  "headset-hg9067": "Marvo HG9067 Tactic 70 (Black / Red)",
  "headset-ca-9011377-eu": "Corsair HS35 v2 (Carbon)",
  "headset-maestro-300": "MSI Maestro 300 (Black)",
  "speakers-mso3": "PREVO MS03 Wireless Stereo Soundbar",
  "speakers-sg-269": "Marvo Scorpion SG-269",
  "speakers-sg-118": "Marvo Scorpion SG-118 (Black)",
  "fans-spr-cf120-arcp12pwmpst-slim": "Arctic P12 Slim PWM PST · 120 mm",
  "fans-spr-cf140-arcp14co-pwm": "Arctic P14 PWM PST CO · 140 mm",
  "external_hdd-ahd710p-1tu31-cyl": "ADATA HD710 Pro · 1 TB / Yellow",
  "external_hdd-ahd710p-5tu31-cbk": "ADATA HD710 Pro · 5 TB / Black",
  "wifi-ma86xe": "Mercusys MA86XE Wi-Fi / Bluetooth PCIe Adapter",
  "wifi-tp-link-archer-txe70uh-axe5400-wi-fi-6e-hig":
    "TP-LINK Archer TXE70UH AXE5400",
  "optical-ebau108": "Lite-On eBAU108 DVD Super Multi (Black)",
  "paste-dp-tim-z3-2": "DeepCool Z3 Thermal Compound",
  "paste-dp-tim-z5-2": "DeepCool Z5 Thermal Compound",
  "fans-0-761345-40060-2": "Antec 0-761345-40060-2 · 120 mm ARGB",
  "monitor-pro-mp271-e14a": "MSI Pro MP271 E14A · 27-inch Full HD",
  "accessories-m-2-ssd-enclosure-usb-c-external-hard-drive":
    "M.2 SSD Enclosure · USB-C",
  "case-wh-case-msiforge112r-black": "MSI MAG FORGE 112R (Black)",
  "case-wh-case-msiforgem100r-black": "MSI MAG FORGE M100R (Black)",
};
export const productName = (p: BuilderProduct) =>
  labels[p.id.replace(/^research-/, "")] ?? p.name;
export const stockLabel = (p: BuilderProduct) =>
  p.stock === "sold_out"
    ? "Sold out in source snapshot"
    : p.stock === "n/a"
      ? "Included with processor"
      : p.stock === "listed"
        ? "Listed in source snapshot"
        : "Availability unconfirmed";
export const productPrice = (p: BuilderProduct) =>
  p.price === null
    ? "Quote required"
    : p.price === 0
      ? "Included"
      : formatPounds(p.price);
