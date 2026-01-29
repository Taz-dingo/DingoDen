import type { Kana } from "../data/kana";

interface DetailPanelProps {
  kana: Kana | null;
  onClose: () => void;
}

export default function DetailPanel({ kana, onClose }: DetailPanelProps) {
  if (!kana) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="text-6xl font-bold">{kana.char}</div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">罗马音</label>
            <p className="text-2xl font-semibold">{kana.romaji}</p>
          </div>

          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">类型</label>
            <p className="text-lg">
              {kana.type === "hiragana" ? "平假名" : "片假名"}
            </p>
          </div>

          {kana.origin && (
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">来源汉字</label>
              <p className="text-lg">{kana.origin}</p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  );
}
