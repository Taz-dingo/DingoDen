import type { Kana } from "../data/kana";

interface KanaCellProps {
  kana: Kana;
  onClick: (kana: Kana) => void;
}

export default function KanaCell({ kana, onClick }: KanaCellProps) {
  return (
    <button
      onClick={() => onClick(kana)}
      className="w-16 h-16 md:w-20 md:h-20 text-2xl md:text-3xl font-bold rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer"
    >
      {kana.char}
    </button>
  );
}
