import { useState } from "react";
import type { Kana } from "../data/kana";
import { kanaGroups } from "../data/kana";
import KanaGrid from "./KanaGrid";
import DetailPanel from "./DetailPanel";

export default function KanaApp() {
  const [type, setType] = useState<"hiragana" | "katakana">("hiragana");
  const [selectedKana, setSelectedKana] = useState<Kana | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">日语五十音</h1>

          <div className="inline-flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-md">
            <button
              onClick={() => setType("hiragana")}
              className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                type === "hiragana"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              平假名
            </button>
            <button
              onClick={() => setType("katakana")}
              className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                type === "katakana"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              片假名
            </button>
          </div>
        </header>

        <KanaGrid groups={kanaGroups} type={type} onKanaClick={setSelectedKana} />
      </div>

      <DetailPanel kana={selectedKana} onClose={() => setSelectedKana(null)} />
    </div>
  );
}
