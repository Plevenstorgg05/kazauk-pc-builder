import type { Category } from "@/lib/catalog/schema";
interface Guide {
  title: string;
  intro: string;
  tip: string;
  terms: [string, string][];
  faqs: [string, string][];
}
/** General buying education, separate from catalogue facts and compatibility verdicts. */
export const GUIDES: Record<Category, Guide> = {
  cpu: {
    title: "Start with the brain.",
    intro:
      "The processor runs game logic, simulation and everyday tasks. Choose the platform first; the motherboard and memory need to follow.",
    tip: "Compare cores, threads and the work you do. Core count alone does not establish which CPU is faster in a game.",
    terms: [
      [
        "Cores & threads",
        "Cores execute work; threads describe the simultaneous execution streams the processor supports.",
      ],
      [
        "Socket",
        "The physical CPU connection. AM4 and AM5 cannot be interchanged.",
      ],
      [
        "Clock & cache",
        "Clock measures cycles per second; cache keeps frequently used data close to the cores. Neither alone predicts frame rate.",
      ],
      [
        "Integrated graphics",
        "Useful for a basic display output or diagnosis. It is distinct from a dedicated gaming graphics card.",
      ],
    ],
    faqs: [
      [
        "Do I need a separate cooler?",
        "Some boxed CPUs include one. The build sheet recognises the included cooler; other processors need a selected cooling solution.",
      ],
      [
        "Will more cores always improve gaming?",
        "No. Game engine, graphics card, settings and CPU architecture all matter. This demo does not predict frame rates.",
      ],
    ],
  },
  motherboard: {
    title: "The foundation matters.",
    intro:
      "Your motherboard connects every part. Match the CPU socket and memory generation, then consider the board size and features you actually need.",
    tip: "A higher chipset number is not a gaming-performance score. Check the exact board’s ports and expansion support with its manufacturer.",
    terms: [
      ["Chipset", "Helps define platform connectivity and expansion features."],
      [
        "Form factor",
        "ATX, micro-ATX and ITX describe board formats; the case must explicitly support yours.",
      ],
      [
        "Memory support",
        "DDR4 and DDR5 use different slots and are not interchangeable.",
      ],
      [
        "Expansion & connectivity",
        "USB, networking and expansion slots vary by model. Details absent from the catalogue must be checked separately.",
      ],
    ],
    faqs: [
      [
        "Is the CPU socket enough to guarantee support?",
        "No. BIOS support can also matter. This demo checks the supplied rules; confirm the manufacturer’s CPU support list before purchasing.",
      ],
      [
        "Can a small motherboard fit a large case?",
        "Often, but use the case’s published support list rather than assuming.",
      ],
    ],
  },
  memory: {
    title: "Room for everything you run.",
    intro:
      "RAM holds the data your applications are using right now. Capacity, generation and module format matter before headline speed.",
    tip: "Compare like-for-like kits. A laptop SO-DIMM cannot fit a desktop DIMM slot, even when both are DDR5.",
    terms: [
      [
        "Capacity",
        "Measured in GB. The right amount depends on your games and other applications.",
      ],
      [
        "MT/s",
        "Memory transfer rate. Advertised overclocking profiles depend on platform support and settings.",
      ],
      [
        "Latency",
        "Timing delays such as CAS latency. Lower numbers alone do not prove a faster kit at different transfer rates.",
      ],
      [
        "Dual channel",
        "Using the appropriate paired slots can enable two memory channels. Follow the motherboard manual.",
      ],
    ],
    faqs: [
      [
        "Does DDR5 work in a DDR4 board?",
        "No. The electrical and physical interfaces differ.",
      ],
      [
        "Will a kit always run at its advertised speed?",
        "Not necessarily. Profiles, BIOS, CPU and motherboard support all affect the settings available.",
      ],
    ],
  },
  gpu: {
    title: "Make every frame count.",
    intro:
      "The graphics card renders the game. Compare the exact manufacturer’s model, available dimensions and power requirements.",
    tip: "Resolution and graphics settings affect GPU demands. Compare independent testing for your games; there are no benchmark estimates in this configurator.",
    terms: [
      [
        "VRAM",
        "Dedicated graphics memory used for textures and other rendering data. Capacity alone does not measure GPU speed.",
      ],
      [
        "Card dimensions",
        "Length is checked against case clearance where published. Thickness, cables and radiator placement can require additional manual checks.",
      ],
      [
        "Power connectors",
        "The plug type and quantity matter alongside PSU wattage. A sufficient wattage is not proof of the right cables.",
      ],
      [
        "Display outputs",
        "Check the exact model for suitable ports and monitor support. These are not fully captured in this catalogue.",
      ],
    ],
    faqs: [
      [
        "Will a graphics card fit if its length fits?",
        "Length is only one constraint. Slot thickness, cable bend space and installed radiators may also matter.",
      ],
      [
        "Are all cards with the same GPU identical?",
        "No. Cooler, dimensions, clock settings and connectors can vary by manufacturer and variant.",
      ],
    ],
  },
  case: {
    title: "Give your build its home.",
    intro:
      "Your case defines the physical envelope, airflow paths and the look of the finished machine. Check fit before choosing by appearance.",
    tip: "Radiator support, GPU clearance and cooler height are separate constraints. Published limits may depend on how the case is populated.",
    terms: [
      [
        "Airflow",
        "Intake and exhaust paths move heat out of the enclosure. Fan configuration and obstructions matter.",
      ],
      [
        "GPU clearance",
        "The maximum published graphics-card length. Conflicting sources remain flagged for verification.",
      ],
      [
        "Cooler clearance",
        "The space available above the CPU for an air cooler. This limit is displayed; the current engine does not evaluate air-cooler height.",
      ],
      [
        "Radiator mounting",
        "A supported radiator size does not establish every thickness or component-clearance combination.",
      ],
    ],
    faqs: [
      [
        "Does a case include the hardware shown in its photos?",
        "No. Manufacturer photos may show an example build. Only your selected components contribute to this demo’s total.",
      ],
      [
        "Why are some dimensions unknown?",
        "The snapshot intentionally preserves missing or conflicting information instead of guessing.",
      ],
    ],
  },
  cooler: {
    title: "Keep performance under control.",
    intro:
      "Cooling transfers heat away from your CPU. Choose compatible mounting, then check the space your case provides.",
    tip: "An AIO needs a suitable radiator mount. An air cooler needs sufficient height clearance, which should be checked manually for this dataset.",
    terms: [
      [
        "Air cooling",
        "A heatsink and fan move heat into the case airflow. Height and socket mounting matter.",
      ],
      [
        "AIO liquid cooling",
        "A sealed loop moves heat from the CPU block to a radiator. It needs a compatible mounting location.",
      ],
      [
        "Radiator size",
        "Nominal sizes such as 240 or 360 mm describe the fan format, not every external dimension.",
      ],
      [
        "Socket support",
        "The mounting kit must explicitly support your CPU platform. An unpublished list remains unknown.",
      ],
    ],
    faqs: [
      [
        "Is liquid cooling always better?",
        "No. Noise, thermal load, radiator space, cost and maintenance considerations differ.",
      ],
      [
        "Can I select the included Wraith cooler for any CPU?",
        "No. This catalogue includes it only with the Ryzen 5 7600; the boxed-cooler rule enforces that relationship.",
      ],
    ],
  },
  psu: {
    title: "Power, with confidence.",
    intro:
      "The power supply feeds every component. Check output, connectors and the exact model before relying on a wattage figure.",
    tip: "Every PSU connector list is missing in this snapshot. A complete build therefore still requires connector verification.",
    terms: [
      [
        "Wattage",
        "The supply’s rated output. Compare it with the GPU recommendation and a suitable allowance for the whole system.",
      ],
      [
        "Efficiency",
        "An efficiency certification describes conversion losses under defined conditions; it is not a complete quality rating.",
      ],
      [
        "Modular cables",
        "Removable cables simplify routing. Do not interchange modular cables between supplies unless the manufacturer explicitly permits it.",
      ],
      [
        "Headroom",
        "Extra capacity beyond an estimate. This demo’s overhead and multiplier are provisional, not an electrical design guarantee.",
      ],
    ],
    faqs: [
      [
        "Does enough wattage prove compatibility?",
        "No. Connector type, count, cable compatibility and transient demands also matter.",
      ],
      [
        "Why does the build still show an advisory?",
        "PSU connector inventories are not captured, so the engine correctly reports insufficient data.",
      ],
    ],
  },
};
