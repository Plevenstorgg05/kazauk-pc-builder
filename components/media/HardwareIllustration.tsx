import type { BuilderCategory } from "@/lib/builder/categories";
/** Deliberately schematic: never a substitute photograph or an invented commercial SKU. */
export function HardwareIllustration({
  category,
}: {
  category: BuilderCategory;
}) {
  const fan = (
    <>
      <circle cx="160" cy="112" r="70" />
      <circle cx="160" cy="112" r="57" />
      {Array.from({ length: 7 }, (_, i) => (
        <path
          key={i}
          transform={`rotate(${(i * 360) / 7} 160 112)`}
          d="M160 101c-14-34-5-49 16-44 18 4 25 18 12 31-8 9-17 11-28 13Z"
          fill="currentColor"
          opacity=".12"
        />
      ))}
      <circle cx="160" cy="112" r="16" fill="#e7e7e2" />
      <circle cx="160" cy="112" r="5" />
    </>
  );
  const circuit = (
    <>
      <rect x="66" y="38" width="188" height="141" rx="3" />
      <path d="M88 159h140M101 56v43h38M221 56v43h-37M139 121v38m45-38v38" />
      <rect x="134" y="77" width="52" height="48" />
      <path d="M92 179v13h135v-13" />
      {Array.from({ length: 18 }, (_, i) => (
        <path key={i} d={`M${97 + i * 7} 183v8`} />
      ))}
    </>
  );
  let drawing;
  switch (category) {
    case "cpu":
      drawing = (
        <>
          <rect x="90" y="44" width="140" height="140" rx="5" />
          <path d="M115 62h92l8 8v90h-101V62Z" />
          <path d="M101 73v82m118-82v82" />
          {Array.from({ length: 11 }, (_, i) => (
            <g key={i}>
              <path
                d={`M${100 + i * 12} 36v8m0 140v9M82 ${52 + i * 12}h8m140 0h9`}
              />
            </g>
          ))}
          <path d="M130 93h60m-60 15h60m-60 15h38" />
        </>
      );
      break;
    case "memory":
      drawing = (
        <>
          <path d="M42 76h236v74H42zM54 85h214v48H54zM51 150v17h102v-10h9v10h107v-17" />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={62 + i * 25} y="96" width="17" height="25" />
          ))}
          {Array.from({ length: 28 }, (_, i) => (
            <path key={i} d={`M${55 + i * 7.5} 153v11`} />
          ))}
          <path d="M66 66h90m-90-8h50" />
        </>
      );
      break;
    case "fans":
      drawing = (
        <>
          <rect x="78" y="30" width="164" height="164" rx="8" />
          {fan}
          {[
            [89, 41],
            [231, 41],
            [89, 183],
            [231, 183],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3" />
          ))}
        </>
      );
      break;
    case "cooler":
      drawing = (
        <>
          <path d="M88 167h144l-12 18H100zM109 185v12m102-12v12" />
          {Array.from({ length: 10 }, (_, i) => (
            <path key={i} d={`M87 ${55 + i * 11}h146`} />
          ))}
          <g transform="translate(0 -3) scale(1 .9)">{fan}</g>
        </>
      );
      break;
    case "hdd":
    case "external_hdd":
      drawing = (
        <>
          <rect
            x="87"
            y="24"
            width="147"
            height="184"
            rx={category === "hdd" ? 5 : 16}
          />
          {category === "hdd" ? (
            <>
              <circle cx="161" cy="107" r="57" />
              <circle cx="161" cy="107" r="17" />
              <path d="m208 151-46-39m46 39 8-16-40-25" />
              <circle cx="211" cy="154" r="8" />
            </>
          ) : (
            <>
              <path d="M109 47h103v129H109zM141 191h39" />
              <circle cx="209" cy="190" r="2" />
            </>
          )}
          <path d="M108 201h26m8 0h15m9 0h31" />
        </>
      );
      break;
    case "external_ssd":
      drawing = (
        <>
          <rect x="76" y="54" width="169" height="121" rx="13" />
          <rect x="93" y="71" width="134" height="87" rx="6" />
          <path d="M141 175v7h40v-7M118 101h84m-84 14h65" />
          <circle cx="211" cy="146" r="2" />
        </>
      );
      break;
    case "ssd":
      drawing = (
        <>
          <path d="M37 86h246v57H37zM48 86v57m215-57v57" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={65 + i * 45} y="96" width="32" height="36" />
          ))}
          <circle cx="273" cy="114" r="4" />
          <path d="M29 98h8m-8 11h8m-8 11h8m-8 11h8" />
        </>
      );
      break;
    case "case":
      drawing = (
        <>
          <path d="m97 22 122 17v158l-122 15zM97 22 72 36v155l25 21M72 36l25 10 122-7M97 46v166" />
          <path d="M110 61h94v115h-94z" />
          {[88, 120, 152].map((y) => (
            <circle key={y} cx="187" cy={y} r="12" />
          ))}
          <path d="M111 187h32m-63 11v10m120-10v10" />
        </>
      );
      break;
    case "gpu":
      drawing = (
        <>
          <path d="M36 70h238v88H36zM274 62h12v105h-12M64 158v12h164v-12" />
          {[105, 214].map((x) => (
            <g key={x}>
              <circle cx={x} cy="114" r="34" />
              <circle cx={x} cy="114" r="9" />
              {[0, 60, 120, 180, 240, 300].map((r) => (
                <path
                  key={r}
                  transform={`rotate(${r} ${x} 114)`}
                  d={`M${x} 103q-20-18-16-20 22 0 27 13`}
                />
              ))}
            </g>
          ))}
        </>
      );
      break;
    case "motherboard":
      drawing = (
        <>
          <rect x="75" y="20" width="170" height="195" />
          <rect x="114" y="54" width="62" height="61" />
          <path d="M188 39v105m12-105v105m12-105v105M99 146h125m-125 13h125m-125 23h125" />
          <circle cx="103" cy="56" r="13" />
          <circle cx="96" cy="202" r="3" />
          <circle cx="229" cy="32" r="3" />
          <rect x="82" y="88" width="18" height="43" />
        </>
      );
      break;
    case "psu":
      drawing = (
        <>
          <path d="m61 72 57-32 151 28v118l-57 24-151-33zM61 72l151 29 57-33M212 101v109" />
          <ellipse cx="137" cy="127" rx="57" ry="43" />
          <ellipse cx="137" cy="127" rx="46" ry="34" />
          <ellipse cx="137" cy="127" rx="14" ry="11" />
          <path d="M230 113v55m13-50v44m13-49v44M116 188v11m24-7v11" />
        </>
      );
      break;
    case "monitor":
      drawing = (
        <>
          <rect x="42" y="33" width="236" height="145" rx="4" />
          <path d="M51 42h218v125H51zM145 178v23h30v-23m-57 31h84" />
        </>
      );
      break;
    case "keyboard":
      drawing = (
        <>
          <path d="M28 64h264v111H28z" />
          {Array.from({ length: 5 }, (_, r) => (
            <g key={r}>
              {Array.from({ length: r === 4 ? 5 : 15 }, (_, c) => (
                <rect
                  key={c}
                  x={38 + c * (r === 4 ? 46 : 16)}
                  y={75 + r * 18}
                  width={r === 4 ? 39 : 11}
                  height="11"
                />
              ))}
            </g>
          ))}
        </>
      );
      break;
    case "mouse":
      drawing = (
        <>
          <path d="M159 26c-42 0-63 46-63 102 0 53 25 82 63 82s64-29 64-82c0-56-22-102-64-102Z" />
          <path d="M159 28v70m-59 17q59 19 119 0" />
          <rect x="151" y="53" width="16" height="30" rx="6" />
        </>
      );
      break;
    case "headset":
      drawing = (
        <>
          <path d="M77 131V97a83 83 0 0 1 166 0v34M91 131V97a69 69 0 0 1 138 0v34" />
          <rect x="68" y="117" width="32" height="72" rx="13" />
          <rect x="220" y="117" width="32" height="72" rx="13" />
          <path d="M227 178q-1 33-55 33m-19 0h19" />
        </>
      );
      break;
    case "speakers":
      drawing = (
        <>
          {[64, 194].map((x) => (
            <g key={x}>
              <rect x={x} y="43" width="64" height="146" rx="3" />
              <circle cx={x + 32} cy="89" r="15" />
              <circle cx={x + 32} cy="145" r="23" />
              <circle cx={x + 32} cy="145" r="8" />
            </g>
          ))}
        </>
      );
      break;
    case "optical":
      drawing = (
        <>
          <path d="m45 80 182-31 50 71-182 36zM45 80v49l50 59 182-35v-33M95 156v32" />
          <ellipse cx="160" cy="105" rx="51" ry="28" />
          <ellipse cx="160" cy="105" rx="10" ry="6" />
          <path d="m123 166 83-15" />
        </>
      );
      break;
    case "wifi":
      drawing = (
        <>
          {circuit}
          <path d="M91 38V11m135 27V11m-132 0h-6m135 0h6" />
        </>
      );
      break;
    case "paste":
      drawing = (
        <>
          <path d="m87 164 111-111 28 28-111 111zM192 59l-9-9 22-22 44 44-22 22-9-9M87 164l-15 30 30-15M126 122l28 28" />
        </>
      );
      break;
    case "lighting":
      drawing = (
        <>
          <path d="M42 82h236v69H42zM42 94h236m-236 45h236" />
          {[67, 105, 143, 181, 219, 257].map((x) => (
            <rect key={x} x={x - 8} y="107" width="16" height="18" />
          ))}
        </>
      );
      break;
    case "cables":
    case "power_cable":
      drawing = (
        <>
          <path d="M69 51h50v39H69zM190 147h55v45h-55zM83 90v52q0 35 41 35h66M95 90v51q0 24 32 24h63M106 90v47q0 16 27 16h57M80 51V29m17 22V29m13 22V29" />
        </>
      );
      break;
    case "os":
      drawing = (
        <>
          <rect x="75" y="30" width="170" height="177" rx="3" />
          <path d="M104 67h46v45h-46zM164 67h46v45h-46zM104 126h46v45h-46zM164 126h46v45h-46z" />
        </>
      );
      break;
    default:
      drawing = circuit;
  }
  return (
    <svg
      viewBox="0 0 320 240"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      data-illustration-kind={category}
    >
      {drawing}
    </svg>
  );
}
