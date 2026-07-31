type MagicMicroEffectVariant = "vine" | "ripple" | "star-trail" | "rune" | "wave";

type Props = {
  variant: MagicMicroEffectVariant;
  className?: string;
};

export function MagicMicroEffect({ variant, className = "" }: Props) {
  if (variant === "ripple") {
    return (
      <div className={`magic-micro-effect magic-micro-ripple ${className}`} aria-hidden="true">
        <i className="micro-ripple-halo" />
        <i className="micro-ripple-core" />
        <i className="micro-ripple-ring ring-one" />
        <i className="micro-ripple-ring ring-two" />
        <i className="micro-ripple-ring ring-three" />
        <i className="micro-ripple-ring ring-four" />
        <i className="micro-ripple-drop drop-one" />
        <i className="micro-ripple-drop drop-two" />
        <i className="micro-ripple-drop drop-three" />
      </div>
    );
  }

  if (variant === "rune") {
    return (
      <div className={`magic-micro-effect magic-micro-rune ${className}`} aria-hidden="true">
        <i className="micro-rune-ring micro-rune-ring-outer" />
        <i className="micro-rune-ring" />
        <i className="micro-rune-star">✦</i>
        <i className="micro-rune-ray ray-one" />
        <i className="micro-rune-ray ray-two" />
        <i className="micro-rune-glyphs">· ᚱ · ᛟ ·</i>
      </div>
    );
  }

  if (variant === "wave") {
    return (
      <div className={`magic-micro-effect magic-micro-wave ${className}`} aria-hidden="true">
        <svg viewBox="0 0 240 34" preserveAspectRatio="none">
          <path className="micro-wave-line wave-ghost" d="M2 18 C25 5 43 30 67 17 S111 5 134 18 S178 31 202 16 S225 9 238 17" />
          <path className="micro-wave-line wave-one" d="M2 18 C25 5 43 30 67 17 S111 5 134 18 S178 31 202 16 S225 9 238 17" />
          <path className="micro-wave-line wave-two" d="M5 22 C28 11 45 31 69 21 S113 9 136 21 S180 30 203 20 S225 13 236 20" />
          <path className="micro-wave-line wave-three" d="M4 13 C29 1 47 24 70 13 S112 1 137 14 S180 25 205 12 S227 5 238 12" />
          <circle className="micro-wave-glint glint-one" cx="67" cy="17" r="2.2" />
          <circle className="micro-wave-glint glint-two" cx="137" cy="14" r="1.7" />
          <circle className="micro-wave-glint glint-three" cx="205" cy="12" r="1.4" />
        </svg>
      </div>
    );
  }

  if (variant === "star-trail") {
    return (
      <div className={`magic-micro-effect magic-micro-star-trail ${className}`} aria-hidden="true">
        <svg viewBox="0 0 260 38" preserveAspectRatio="none">
          <path className="micro-star-baseline" d="M3 28 C44 6 82 34 122 15 S196 2 257 19" />
          <path className="micro-star-path" d="M3 28 C44 6 82 34 122 15 S196 2 257 19" />
          <path className="micro-star-echo" d="M3 28 C44 6 82 34 122 15 S196 2 257 19" />
          <circle className="micro-star-comet" cx="0" cy="0" r="3.2">
            <animateMotion dur="6.8s" repeatCount="indefinite" path="M3 28 C44 6 82 34 122 15 S196 2 257 19" />
          </circle>
          <circle className="micro-star-node node-one" cx="38" cy="17" r="1.4" />
          <circle className="micro-star-node node-two" cx="176" cy="7" r="1.2" />
          <circle className="micro-star-node node-three" cx="247" cy="16" r="1.5" />
          <g className="micro-star-spark spark-one" transform="translate(122 15)"><path d="M0-5 1.4-1.4 5 0 1.4 1.4 0 5-1.4 1.4-5 0-1.4-1.4Z" /></g>
          <g className="micro-star-spark spark-two" transform="translate(224 13)"><path d="M0-3 1-1 3 0 1 1 0 3-1 1-3 0-1-1Z" /></g>
        </svg>
      </div>
    );
  }

  return (
    <div className={`magic-micro-effect magic-micro-vine ${className}`} aria-hidden="true">
      <svg viewBox="0 0 320 62" preserveAspectRatio="none">
        <path className="micro-vine-ghost" d="M4 44 C36 6 67 53 102 29 S164 8 201 33 S269 53 316 13" />
        <path className="micro-vine-stem-glow" d="M4 44 C36 6 67 53 102 29 S164 8 201 33 S269 53 316 13" />
        <path className="micro-vine-stem" d="M4 44 C36 6 67 53 102 29 S164 8 201 33 S269 53 316 13" />
        <path className="micro-vine-tendril tendril-one" d="M102 29 C86 17 81 4 94 2 C107 0 111 15 102 29" />
        <path className="micro-vine-tendril tendril-two" d="M201 33 C218 17 222 4 209 2 C197 1 193 17 201 33" />
        <path className="micro-vine-leaf leaf-one" d="M61 35 C50 25 52 18 65 20 C71 27 68 33 61 35Z" />
        <path className="micro-vine-leaf leaf-two" d="M115 24 C116 13 124 9 132 16 C130 24 123 27 115 24Z" />
        <path className="micro-vine-leaf leaf-three" d="M201 33 C191 23 193 16 205 18 C211 25 208 31 201 33Z" />
        <path className="micro-vine-leaf leaf-four" d="M268 40 C269 29 277 25 286 32 C283 40 276 43 268 40Z" />
        <path className="micro-vine-vein vein-one" d="M61 35 64 21" />
        <path className="micro-vine-vein vein-two" d="M115 24 130 16" />
        <path className="micro-vine-vein vein-three" d="M201 33 204 19" />
        <path className="micro-vine-vein vein-four" d="M268 40 284 32" />
        <g className="micro-vine-blossom blossom-one" transform="translate(94 11)">
          <circle cx="0" cy="-4" r="2.7" /><circle cx="4" cy="0" r="2.7" /><circle cx="0" cy="4" r="2.7" /><circle cx="-4" cy="0" r="2.7" /><circle className="blossom-heart" r="1.9" />
        </g>
        <g className="micro-vine-blossom blossom-two" transform="translate(307 15)">
          <circle cx="0" cy="-4" r="2.7" /><circle cx="4" cy="0" r="2.7" /><circle cx="0" cy="4" r="2.7" /><circle cx="-4" cy="0" r="2.7" /><circle className="blossom-heart" r="1.9" />
        </g>
      </svg>
    </div>
  );
}
