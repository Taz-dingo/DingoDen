import type { KanaGroup } from "../data/kana";
import KanaCell from "./KanaCell";

interface KanaGridProps {
  groups: KanaGroup[];
  type: "hiragana" | "katakana";
  onKanaClick: (kana: import("../data/kana").Kana) => void;
}

export default function KanaGrid({ groups, type, onKanaClick }: KanaGridProps) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.name} className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {group.name}
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {[group[type].a, group[type].i, group[type].u, group[type].e, group[type].o].map(
              (kana, index) => (
                <KanaCell key={index} kana={kana} onClick={onKanaClick} />
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
