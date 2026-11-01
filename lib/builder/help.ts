import { GUIDES } from "@/lib/configurator/education";
import {
  isCoreCategory,
  categoryInfo,
  type BuilderCategory,
} from "./categories";
type Term = [string, string];
interface Guide {
  title: string;
  intro: string;
  tip: string;
  terms: Term[];
  faqs: Term[];
}
const extra: Partial<Record<BuilderCategory, { terms: Term[]; faq: Term }>> = {
  ssd: {
    terms: [
      [
        "NVMe vs SATA",
        "NVMe communicates over PCIe; SATA is a different storage interface. M.2 describes the shape, not the protocol.",
      ],
      [
        "Capacity",
        "Leave working space for updates and temporary files. Advertised GB/TB and operating-system capacity displays can differ.",
      ],
      [
        "PCIe generation",
        "Generation and lane width define link capabilities. Actual transfer speeds also depend on the drive, controller and workload.",
      ],
      [
        "Installation",
        "Check drive length, slot keying, motherboard support and any lanes shared with other connectors.",
      ],
    ],
    faq: [
      "Does every M.2 drive fit every M.2 socket?",
      "No. Protocol, keying, length and platform support must match. An M.2 SATA drive is not interchangeable with every NVMe drive.",
    ],
  },
  hdd: {
    terms: [
      [
        "Mechanical storage",
        "HDDs store data on rotating magnetic platters. They offer different access characteristics from solid-state drives.",
      ],
      [
        "Form factor",
        "Internal drives commonly use 3.5-inch or 2.5-inch formats. Check the case bays and mounting hardware.",
      ],
      [
        "Interface and power",
        "A SATA drive needs a data connection and an appropriate power connection. The connectors serve different purposes.",
      ],
      [
        "Rotation and cache",
        "RPM and cache are specifications, not complete performance predictions. Workload and recording technology also matter.",
      ],
    ],
    faq: [
      "Can I use an HDD instead of an SSD in this demo?",
      "Yes. Either internal storage category covers the storage selection. An external drive does not count as internal storage.",
    ],
  },
  external_hdd: {
    terms: [
      [
        "HDD vs SSD",
        "A mechanical drive uses moving platters; an SSD has no moving storage mechanism. Consider portability, capacity and handling.",
      ],
      [
        "USB connection",
        "Check the supplied cable, host port and any required external power. A connector shape alone does not establish transfer speed.",
      ],
      [
        "Portable vs desktop",
        "Some larger external drives require a separate power adapter. Check the exact package and connection.",
      ],
      [
        "Backups",
        "Keep additional copies of important files in separate locations. One external drive is not a complete backup strategy.",
      ],
    ],
    faq: [
      "Does an external HDD count as the PC’s internal storage?",
      "No. It is an optional addition. Choose an internal SSD or HDD separately in the build sheet.",
    ],
  },
  external_ssd: {
    terms: [
      [
        "Solid-state storage",
        "Flash storage has no moving storage mechanism. An enclosure alone is not a complete SSD.",
      ],
      [
        "USB bandwidth",
        "Drive, port, cable and connection mode all affect transfers. A USB-C connector does not promise a particular speed.",
      ],
      [
        "Portability",
        "Check size, supplied cables and any published handling or environmental ratings for the exact model.",
      ],
    ],
    faq: [
      "Will a faster advertised drive always transfer faster?",
      "No. The host interface, workload, file size and drive behaviour can limit actual transfers.",
    ],
  },
  optical: {
    terms: [
      [
        "DVD vs Blu-ray",
        "DVD capability does not imply Blu-ray support. Check the exact media formats listed for the drive.",
      ],
      [
        "Read vs write",
        "A drive may read a format without supporting writing to it. Supported disc types and speeds vary.",
      ],
      [
        "USB and software",
        "Confirm the cable, power needs, operating-system support and any software needed for your media.",
      ],
    ],
    faq: [
      "Can a DVD drive play Blu-ray discs?",
      "Only if the exact product explicitly supports Blu-ray. The DVD drive in this catalogue must not be assumed to do so.",
    ],
  },
  monitor: {
    terms: [
      [
        "Resolution",
        "The number of display pixels. Higher resolutions usually demand more rendering work at similar settings.",
      ],
      [
        "Refresh rate",
        "The number of display updates per second, measured in Hz. It is distinct from the frame rate the PC renders.",
      ],
      [
        "Connections",
        "Check the display mode supported by the exact GPU port, display input and cable.",
      ],
    ],
    faq: [
      "Does a 144 Hz display guarantee 144 frames per second?",
      "No. The display’s refresh capability and the game’s rendered frame rate are separate.",
    ],
  },
  fans: {
    terms: [
      [
        "Size and thickness",
        "Match the mounting pattern and available space, including nearby radiators and cables.",
      ],
      [
        "PWM and speed",
        "A compatible PWM control signal can vary fan speed. Fan curves depend on the controller or motherboard.",
      ],
      [
        "Airflow path",
        "Intake and exhaust placement, obstructions and installed filters all affect how air moves through a case.",
      ],
    ],
    faq: [
      "Can I fill every fan position and radiator mount together?",
      "Not necessarily. Mounts can overlap, and clearance depends on thickness and nearby components. Check the case manual.",
    ],
  },
  paste: {
    terms: [
      [
        "Thermal interface",
        "Compound fills microscopic gaps between the heat spreader and the cooler base. It does not replace a cooler.",
      ],
      [
        "Included compound",
        "A cooler may supply a tube or pre-applied material. Check before adding more.",
      ],
      [
        "Application",
        "Follow the cooler and compound instructions. Clean old material appropriately before reapplication.",
      ],
    ],
    faq: [
      "Is extra thermal paste always necessary?",
      "No. Many cooling packages include suitable compound. This category is optional.",
    ],
  },
  lighting: {
    terms: [
      [
        "RGB vs ARGB",
        "12 V RGB and 5 V addressable RGB use different electrical arrangements. Never interchange their connections.",
      ],
      [
        "Controller",
        "A controller may need power, a signal connection or software support. Check the complete setup.",
      ],
      [
        "Ratings",
        "Respect the supported voltage, connector type and current limits for every connected device.",
      ],
    ],
    faq: [
      "Does a matching connector shape establish support?",
      "No. Check voltage, pin arrangement, supported devices and power ratings with the manufacturer.",
    ],
  },
  cables: {
    terms: [
      [
        "Extensions vs replacement cables",
        "An extension attaches to an existing cable. A replacement modular cable connects to the PSU and needs exact approval.",
      ],
      [
        "PSU pinouts",
        "Modular PSU-side connections are not universal. Cables from different supplies are not automatically interchangeable.",
      ],
      [
        "Routing space",
        "Plan cable length, bends and panel clearance alongside the installed components.",
      ],
    ],
    faq: [
      "Can I use any modular PSU cable kit?",
      "No. Use a kit explicitly approved for the exact power-supply model. Demo selection does not establish that approval.",
    ],
  },
  cooling_accessories: {
    terms: [
      [
        "Fan control",
        "PWM controllers and splitters need compatible headers, power and supported fan connections.",
      ],
      [
        "Lighting control",
        "ARGB and RGB control are separate from fan-motor power. Confirm each connector and voltage.",
      ],
      [
        "Capacity",
        "A port count does not prove sufficient current capacity for every possible connected device. Check the ratings.",
      ],
    ],
    faq: [
      "Does a controller make every fan compatible?",
      "No. Check connectors, voltage, current limits and control requirements for both the controller and fan.",
    ],
  },
  wifi: {
    terms: [
      [
        "PCIe vs USB",
        "Internal cards use expansion space; USB adapters use an external port. Check antenna placement and drivers.",
      ],
      [
        "Wi-Fi bands",
        "The adapter and router must support the intended band and operating mode. Advertised rates are not real transfer guarantees.",
      ],
      [
        "Bluetooth",
        "Some internal adapters need an additional USB header connection for Bluetooth. Check the exact installation instructions.",
      ],
    ],
    faq: [
      "Do I need an adapter if my motherboard has Wi-Fi?",
      "Often not. Compare the board’s built-in networking with the connection you need before adding another adapter.",
    ],
  },
  sound: {
    terms: [
      [
        "Inputs and outputs",
        "Choose the analogue or digital connections needed for your speakers, headphones and microphones.",
      ],
      [
        "Expansion interface",
        "Internal cards need space and a supported slot. External audio devices use a different connection.",
      ],
      [
        "Drivers",
        "Operating-system support, control software and recording features vary by product.",
      ],
    ],
    faq: [
      "Is a separate sound card essential?",
      "No. Many motherboards provide audio already. Dedicated hardware is an optional choice for particular connections or workflows.",
    ],
  },
  capture: {
    terms: [
      [
        "Capture vs passthrough",
        "The signal a card can pass to a display can differ from the signal it can record. Check both.",
      ],
      [
        "Source format",
        "Confirm resolution, refresh rate and any HDR requirements for the external source.",
      ],
      [
        "Bandwidth and software",
        "PCIe or USB capability and application support can limit recording modes. Protected content may not be capturable.",
      ],
    ],
    faq: [
      "Does a capture card improve game rendering speed?",
      "A capture card handles a video input for recording or streaming; it is not a replacement for the graphics card.",
    ],
  },
  expansion: {
    terms: [
      [
        "Slot format",
        "A physically fitting slot does not establish lane availability, bandwidth or protocol support.",
      ],
      [
        "Clearance",
        "A large GPU can obstruct nearby slots. Check the installed layout, not only the board photograph.",
      ],
      [
        "Drivers and power",
        "Confirm operating-system support and any additional power or internal cabling requirements.",
      ],
    ],
    faq: [
      "Can every unused slot accept any expansion card?",
      "No. Connector type, lane requirements, protocol, firmware and physical clearance matter.",
    ],
  },
  keyboard: {
    terms: [
      [
        "Layout",
        "Check UK versus other layouts and the position of frequently used keys.",
      ],
      [
        "Size",
        "Full-size, tenkeyless and compact layouts trade dedicated keys for desk space.",
      ],
      [
        "Switches and connection",
        "Mechanical, membrane and hybrid designs differ. Wired and wireless models have different power and connection needs.",
      ],
    ],
    faq: [
      "Does a compact keyboard keep every dedicated key?",
      "Usually some functions move to layers or shortcuts. Check the exact layout before choosing.",
    ],
  },
  mouse: {
    terms: [
      [
        "Shape and grip",
        "Size, weight and shape matter alongside sensor specifications. Personal preference is central.",
      ],
      [
        "DPI",
        "A sensitivity specification, not a complete measure of tracking quality or accuracy.",
      ],
      [
        "Connection",
        "Wired, radio and Bluetooth modes differ by model. Check dongles, charging and supported modes.",
      ],
    ],
    faq: [
      "Is the highest DPI always best?",
      "No. A useful sensitivity and comfortable shape depend on your setup and preference.",
    ],
  },
  headset: {
    terms: [
      [
        "Connection",
        "USB, analogue, radio and Bluetooth products need different ports or receivers.",
      ],
      [
        "Microphone",
        "Check connector arrangements, controls and supported applications for voice use.",
      ],
      [
        "Virtual surround",
        "A software processing feature does not mean the headset has a physical multichannel speaker array.",
      ],
    ],
    faq: [
      "Will every headset work through every audio port?",
      "No. Check the exact connection, any splitter or adapter requirement, and operating-system support.",
    ],
  },
  speakers: {
    terms: [
      [
        "Power vs audio",
        "USB may supply power, audio or both. Check whether a separate analogue or wireless connection is needed.",
      ],
      [
        "Placement",
        "Desk space and listening distance affect practical speaker placement.",
      ],
      [
        "Connections",
        "Confirm the audio output, Bluetooth support where applicable and any required power adapter.",
      ],
    ],
    faq: [
      "Does a USB power lead mean USB audio is supported?",
      "No. Some speakers use USB only for power and a separate connection for the audio signal.",
    ],
  },
  os: {
    terms: [
      [
        "Licence",
        "Check edition, licence type and the conditions under which the licence may be used or transferred.",
      ],
      [
        "Installation media",
        "A DVD package may need an optical drive or another authorised installation method.",
      ],
      [
        "Platform support",
        "Firmware features, drivers and official system requirements must be checked for the complete specification.",
      ],
    ],
    faq: [
      "Does choosing an operating system install or activate it?",
      "No. This demo records a selection only. No licence, installation or activation is supplied.",
    ],
  },
  power_cable: {
    terms: [
      [
        "Appliance connector",
        "Confirm the exact connector required by the power supply or device.",
      ],
      [
        "Plug and rating",
        "Use the appropriate local plug, fuse and current rating specified for the equipment.",
      ],
      [
        "Included contents",
        "The PSU or device may already include a suitable mains lead. Check before adding another.",
      ],
    ],
    faq: [
      "Are all power leads interchangeable?",
      "No. Connector, rating, plug and equipment requirements must all be suitable.",
    ],
  },
  accessories: {
    terms: [
      [
        "Included contents",
        "Read what is supplied. An enclosure or adapter does not include a storage drive unless stated.",
      ],
      [
        "Interfaces",
        "Check the exact dimensions, connection and protocol for any adapter or enclosure.",
      ],
      [
        "Overlap",
        "Bundles and supplied accessories may overlap with other selected products.",
      ],
    ],
    faq: [
      "Does an empty drive enclosure add storage capacity?",
      "No. It needs a separately supplied compatible drive and does not satisfy internal-storage selection.",
    ],
  },
};
export function helpFor(category: BuilderCategory): Guide {
  const c = categoryInfo(category);
  if (isCoreCategory(category)) {
    const guide = GUIDES[category];
    const terms = guide.terms.map(
      ([label, definition]): Term => [
        label,
        definition
          .replace(
            "Length is checked against case clearance where published.",
            "Check published length against case clearance.",
          )
          .replace(
            "Conflicting sources remain flagged for verification.",
            "Conflicting published limits need verification.",
          )
          .replace(
            "This limit is displayed; the current engine does not evaluate air-cooler height.",
            "Check the installed cooler height against the published case limit.",
          )
          .replace(
            "This demo’s overhead and multiplier are provisional, not an electrical design guarantee.",
            "Estimate total system demand using appropriate manufacturer guidance; a demo total is not an electrical design calculation.",
          ),
      ],
    );
    const faqs = guide.faqs.map(
      ([question, answer]): Term => [
        question,
        answer
          .replace(
            "This demo checks the supplied rules;",
            "This demo allows unrestricted combinations;",
          )
          .replace(
            "No. This catalogue includes it only with the Ryzen 5 7600; the boxed-cooler rule enforces that relationship.",
            "The demo permits that selection, but it is not a physical compatibility guarantee. The original catalogue supplies this cooler with the Ryzen 5 7600.",
          )
          .replace(
            "PSU connector inventories are not captured, so the engine correctly reports insufficient data.",
            "This demo does not validate hardware combinations. Confirm connector requirements with the manufacturers.",
          ),
      ],
    );
    if (category === "psu")
      faqs[1] = [
        "Does this demo validate the PSU cables?",
        "No. Confirm exact power connectors, cable compatibility and manufacturer requirements before purchasing.",
      ];
    return {
      ...guide,
      terms,
      faqs,
      tip:
        category === "psu"
          ? "Check the complete connection list. Wattage and efficiency alone do not establish suitability."
          : guide.tip,
    };
  }
  const info = extra[category]!;
  return {
    title: c.label,
    intro: c.description,
    tip: c.tip,
    terms: info.terms,
    faqs: [
      info.faq,
      [
        "Is this selection required?",
        category === "ssd" || category === "hdd"
          ? "Choose an internal SSD or HDD to cover storage. You can review a demo specification at any stage."
          : "This category is optional. Leaving it empty does not add missing essential selections.",
      ],
      [
        "Does the demo restrict combinations?",
        "No. All catalogue products remain selectable together. Hardware compatibility is not guaranteed; verify the complete specification before purchasing.",
      ],
    ],
  };
}
