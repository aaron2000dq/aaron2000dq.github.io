type MagicMicroEffectVariant = "vine" | "ripple" | "star-trail" | "rune" | "wave";

type Props = {
  variant: MagicMicroEffectVariant;
  className?: string;
};

export function MagicMicroEffect({ variant, className = "" }: Props) {
  if (variant === "ripple") {
    return (
      <div className={`magic-micro-effect magic-micro-ripple ${className}`} aria-hidden="true">
        <i className="micro-ripple-core" />
        <i className="micro-ripple-ring ring-one" />
        <i className="micro-ripple-ring ring-two" />
        <i className="micro-ripple-ring ring-three" />
      </div>
    );
  }

  if (variant === "rune") {
    return (
      <div className={`magic-micro-effect magic-micro-rune ${className}`} aria-hidden="true">
        <i className="micro-rune-ring" />
        <i className="micro-rune-star">✦</i>
        <i className="micro-rune-ray ray-one" />
        <i className="micro-rune-ray ray-two" />
      </div>
    );
  }

  if (variant === "wave") {
    return (
      <div className={`magic-micro-effect magic-micro-wave ${className}`} aria-hidden="true">
        <svg viewBox="0 0 240 34" preserveAspectRatio="none">
          <path className="micro-wave-line wave-one" d="M2 18 C25 5 43 30 67 17 S111 5 134 18 S178 31 202 16 S225 9 238 17" />
          <path className="micro-wave-line wave-two" d="M5 22 C28 11 45 31 69 21 S113 9 136 21 S180 30 203 20 S225 13 236 20" />
          <circle className="micro-wave-glint" cx="67" cy="17" r="2.2" />
        </svg>
      </div>
    );
  }

  if (variant === "star-trail") {
    return (
      <div className={`magic-micro-effect magic-micro-star-trail ${className}`} aria-hidden="true">
        <svg viewBox="0 0 260 38" preserveAspectRatio="none">
          <path className="micro-star-path" d="M3 28 C44 6 82 34 122 15 S196 2 257 19" />
          <path className="micro-star-echo" d="M3 28 C44 6 82 34 122 15 S196 2 257 19" />
          <circle className="micro-star-comet" cx="3" cy="28" r="2.6" />
          <g className="micro-star-spark spark-one" transform="translate(122 15)"><path d="M0-5 1.4-1.4 5 0 1.4 1.4 0 5-1.4 1.4-5 0-1.4-1.4Z" /></g>
          <g className="micro-star-spark spark-two" transform="translate(224 13)"><path d="M0-3 1-1 3 0 1 1 0 3-1 1-3 0-1-1Z" /></g>
        </svg>
      </div>
    );
  }

  return (
    <div className={`magic-micro-effect magic-micro-vine ${className}`} aria-hidden="true">
      <svg viewBox="0 0 260 44" preserveAspectRatio="none">
        <path className="micro-vine-stem" d="M3 31 C28 6 54 38 81 21 S134 4 162 22 S217 36 257 10" />
        <path className="micro-vine-leaf leaf-one" d="M51 27 C39 15 39 8 54 9 C61 16 59 23 51 27Z" />
        <path className="micro-vine-leaf leaf-two" d="M91 17 C92 4 100 0 110 8 C108 17 101 21 91 17Z" />
        <path className="micro-vine-leaf leaf-three" d="M162 22 C151 10 154 2 167 4 C173 12 170 18 162 22Z" />
        <path className="micro-vine-leaf leaf-four" d="M213 27 C215 14 224 10 234 19 C230 28 222 31 213 27Z" />
        <circle className="micro-vine-bloom" cx="257" cy="10" r="3" />
      </svg>
    </div>
  );
}
