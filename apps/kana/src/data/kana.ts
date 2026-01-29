export type KanaType = "hiragana" | "katakana";

export interface Kana {
  char: string;
  romaji: string;
  type: KanaType;
  origin?: string;
}

export interface KanaGroup {
  name: string;
  hiragana: KanaRow;
  katakana: KanaRow;
}

export interface KanaRow {
  a: Kana;
  i: Kana;
  u: Kana;
  e: Kana;
  o: Kana;
}

const hiraganaA: Kana = { char: "あ", romaji: "a", type: "hiragana", origin: "安" };
const hiraganaI: Kana = { char: "い", romaji: "i", type: "hiragana", origin: "以" };
const hiraganaU: Kana = { char: "う", romaji: "u", type: "hiragana", origin: "宇" };
const hiraganaE: Kana = { char: "え", romaji: "e", type: "hiragana", origin: "衣" };
const hiraganaO: Kana = { char: "お", romaji: "o", type: "hiragana", origin: "於" };

const hiraganaKa: Kana = { char: "か", romaji: "ka", type: "hiragana", origin: "加" };
const hiraganaKi: Kana = { char: "き", romaji: "ki", type: "hiragana", origin: "幾" };
const hiraganaKu: Kana = { char: "く", romaji: "ku", type: "hiragana", origin: "久" };
const hiraganaKe: Kana = { char: "け", romaji: "ke", type: "hiragana", origin: "計" };
const hiraganaKo: Kana = { char: "こ", romaji: "ko", type: "hiragana", origin: "己" };

const hiraganaSa: Kana = { char: "さ", romaji: "sa", type: "hiragana", origin: "左" };
const hiraganaShi: Kana = { char: "し", romaji: "shi", type: "hiragana", origin: "之" };
const hiraganaSu: Kana = { char: "す", romaji: "su", type: "hiragana", origin: "寸" };
const hiraganaSe: Kana = { char: "せ", romaji: "se", type: "hiragana", origin: "世" };
const hiraganaSo: Kana = { char: "そ", romaji: "so", type: "hiragana", origin: "曾" };

const hiraganaTa: Kana = { char: "た", romaji: "ta", type: "hiragana", origin: "太" };
const hiraganaChi: Kana = { char: "ち", romaji: "chi", type: "hiragana", origin: "知" };
const hiraganaTsu: Kana = { char: "つ", romaji: "tsu", type: "hiragana", origin: "川" };
const hiraganaTe: Kana = { char: "て", romaji: "te", type: "hiragana", origin: "天" };
const hiraganaTo: Kana = { char: "と", romaji: "to", type: "hiragana", origin: "止" };

const hiraganaNa: Kana = { char: "な", romaji: "na", type: "hiragana", origin: "奈" };
const hiraganaNi: Kana = { char: "に", romaji: "ni", type: "hiragana", origin: "仁" };
const hiraganaNu: Kana = { char: "ぬ", romaji: "nu", type: "hiragana", origin: "奴" };
const hiraganaNe: Kana = { char: "ね", romaji: "ne", type: "hiragana", origin: "禰" };
const hiraganaNo: Kana = { char: "の", romaji: "no", type: "hiragana", origin: "乃" };

const hiraganaHa: Kana = { char: "は", romaji: "ha", type: "hiragana", origin: "波" };
const hiraganaHi: Kana = { char: "ひ", romaji: "hi", type: "hiragana", origin: "比" };
const hiraganaFu: Kana = { char: "ふ", romaji: "fu", type: "hiragana", origin: "不" };
const hiraganaHe: Kana = { char: "へ", romaji: "he", type: "hiragana", origin: "部" };
const hiraganaHo: Kana = { char: "ほ", romaji: "ho", type: "hiragana", origin: "保" };

const hiraganaMa: Kana = { char: "ま", romaji: "ma", type: "hiragana", origin: "末" };
const hiraganaMi: Kana = { char: "み", romaji: "mi", type: "hiragana", origin: "美" };
const hiraganaMu: Kana = { char: "む", romaji: "mu", type: "hiragana", origin: "武" };
const hiraganaMe: Kana = { char: "め", romaji: "me", type: "hiragana", origin: "女" };
const hiraganaMo: Kana = { char: "も", romaji: "mo", type: "hiragana", origin: "毛" };

const hiraganaYa: Kana = { char: "や", romaji: "ya", type: "hiragana", origin: "也" };
const hiraganaYu: Kana = { char: "ゆ", romaji: "yu", type: "hiragana", origin: "由" };
const hiraganaYo: Kana = { char: "よ", romaji: "yo", type: "hiragana", origin: "与" };

const hiraganaRa: Kana = { char: "ら", romaji: "ra", type: "hiragana", origin: "良" };
const hiraganaRi: Kana = { char: "り", romaji: "ri", type: "hiragana", origin: "利" };
const hiraganaRu: Kana = { char: "る", romaji: "ru", type: "hiragana", origin: "留" };
const hiraganaRe: Kana = { char: "れ", romaji: "re", type: "hiragana", origin: "礼" };
const hiraganaRo: Kana = { char: "ろ", romaji: "ro", type: "hiragana", origin: "呂" };

const hiraganaWa: Kana = { char: "わ", romaji: "wa", type: "hiragana", origin: "和" };
const hiraganaWo: Kana = { char: "を", romaji: "wo", type: "hiragana", origin: "遠" };
const hiraganaN: Kana = { char: "ん", romaji: "n", type: "hiragana", origin: "無" };

// Katakana
const katakanaA: Kana = { char: "ア", romaji: "a", type: "katakana" };
const katakanaI: Kana = { char: "イ", romaji: "i", type: "katakana" };
const katakanaU: Kana = { char: "ウ", romaji: "u", type: "katakana" };
const katakanaE: Kana = { char: "エ", romaji: "e", type: "katakana" };
const katakanaO: Kana = { char: "オ", romaji: "o", type: "katakana" };

const katakanaKa: Kana = { char: "カ", romaji: "ka", type: "katakana" };
const katakanaKi: Kana = { char: "キ", romaji: "ki", type: "katakana" };
const katakanaKu: Kana = { char: "ク", romaji: "ku", type: "katakana" };
const katakanaKe: Kana = { char: "ケ", romaji: "ke", type: "katakana" };
const katakanaKo: Kana = { char: "コ", romaji: "ko", type: "katakana" };

const katakanaSa: Kana = { char: "サ", romaji: "sa", type: "katakana" };
const katakanaShi: Kana = { char: "シ", romaji: "shi", type: "katakana" };
const katakanaSu: Kana = { char: "ス", romaji: "su", type: "katakana" };
const katakanaSe: Kana = { char: "セ", romaji: "se", type: "katakana" };
const katakanaSo: Kana = { char: "ソ", romaji: "so", type: "katakana" };

const katakanaTa: Kana = { char: "タ", romaji: "ta", type: "katakana" };
const katakanaChi: Kana = { char: "チ", romaji: "chi", type: "katakana" };
const katakanaTsu: Kana = { char: "ツ", romaji: "tsu", type: "katakana" };
const katakanaTe: Kana = { char: "テ", romaji: "te", type: "katakana" };
const katakanaTo: Kana = { char: "ト", romaji: "to", type: "katakana" };

const katakanaNa: Kana = { char: "ナ", romaji: "na", type: "katakana" };
const katakanaNi: Kana = { char: "ニ", romaji: "ni", type: "katakana" };
const katakanaNu: Kana = { char: "ヌ", romaji: "nu", type: "katakana" };
const katakanaNe: Kana = { char: "ネ", romaji: "ne", type: "katakana" };
const katakanaNo: Kana = { char: "ノ", romaji: "no", type: "katakana" };

const katakanaHa: Kana = { char: "ハ", romaji: "ha", type: "katakana" };
const katakanaHi: Kana = { char: "ヒ", romaji: "hi", type: "katakana" };
const katakanaFu: Kana = { char: "フ", romaji: "fu", type: "katakana" };
const katakanaHe: Kana = { char: "ヘ", romaji: "he", type: "katakana" };
const katakanaHo: Kana = { char: "ホ", romaji: "ho", type: "katakana" };

const katakanaMa: Kana = { char: "マ", romaji: "ma", type: "katakana" };
const katakanaMi: Kana = { char: "ミ", romaji: "mi", type: "katakana" };
const katakanaMu: Kana = { char: "ム", romaji: "mu", type: "katakana" };
const katakanaMe: Kana = { char: "メ", romaji: "me", type: "katakana" };
const katakanaMo: Kana = { char: "モ", romaji: "mo", type: "katakana" };

const katakanaYa: Kana = { char: "ヤ", romaji: "ya", type: "katakana" };
const katakanaYu: Kana = { char: "ユ", romaji: "yu", type: "katakana" };
const katakanaYo: Kana = { char: "ヨ", romaji: "yo", type: "katakana" };

const katakanaRa: Kana = { char: "ラ", romaji: "ra", type: "katakana" };
const katakanaRi: Kana = { char: "リ", romaji: "ri", type: "katakana" };
const katakanaRu: Kana = { char: "ル", romaji: "ru", type: "katakana" };
const katakanaRe: Kana = { char: "レ", romaji: "re", type: "katakana" };
const katakanaRo: Kana = { char: "ロ", romaji: "ro", type: "katakana" };

const katakanaWa: Kana = { char: "ワ", romaji: "wa", type: "katakana" };
const katakanaWo: Kana = { char: "ヲ", romaji: "wo", type: "katakana" };
const katakanaN: Kana = { char: "ン", romaji: "n", type: "katakana" };

export const kanaGroups: KanaGroup[] = [
  {
    name: "あ行",
    hiragana: { a: hiraganaA, i: hiraganaI, u: hiraganaU, e: hiraganaE, o: hiraganaO },
    katakana: { a: katakanaA, i: katakanaI, u: katakanaU, e: katakanaE, o: katakanaO },
  },
  {
    name: "か行",
    hiragana: { a: hiraganaKa, i: hiraganaKi, u: hiraganaKu, e: hiraganaKe, o: hiraganaKo },
    katakana: { a: katakanaKa, i: katakanaKi, u: katakanaKu, e: katakanaKe, o: katakanaKo },
  },
  {
    name: "さ行",
    hiragana: { a: hiraganaSa, i: hiraganaShi, u: hiraganaSu, e: hiraganaSe, o: hiraganaSo },
    katakana: { a: katakanaSa, i: katakanaShi, u: katakanaSu, e: katakanaSe, o: katakanaSo },
  },
  {
    name: "た行",
    hiragana: { a: hiraganaTa, i: hiraganaChi, u: hiraganaTsu, e: hiraganaTe, o: hiraganaTo },
    katakana: { a: katakanaTa, i: katakanaChi, u: katakanaTsu, e: katakanaTe, o: katakanaTo },
  },
  {
    name: "な行",
    hiragana: { a: hiraganaNa, i: hiraganaNi, u: hiraganaNu, e: hiraganaNe, o: hiraganaNo },
    katakana: { a: katakanaNa, i: katakanaNi, u: katakanaNu, e: katakanaNe, o: katakanaNo },
  },
  {
    name: "は行",
    hiragana: { a: hiraganaHa, i: hiraganaHi, u: hiraganaFu, e: hiraganaHe, o: hiraganaHo },
    katakana: { a: katakanaHa, i: katakanaHi, u: katakanaFu, e: katakanaHe, o: katakanaHo },
  },
  {
    name: "ま行",
    hiragana: { a: hiraganaMa, i: hiraganaMi, u: hiraganaMu, e: hiraganaMe, o: hiraganaMo },
    katakana: { a: katakanaMa, i: katakanaMi, u: katakanaMu, e: katakanaMe, o: katakanaMo },
  },
  {
    name: "や行",
    hiragana: { a: hiraganaYa, i: hiraganaYa, u: hiraganaYu, e: hiraganaYo, o: hiraganaYo },
    katakana: { a: katakanaYa, i: katakanaYa, u: katakanaYu, e: katakanaYo, o: katakanaYo },
  },
  {
    name: "ら行",
    hiragana: { a: hiraganaRa, i: hiraganaRi, u: hiraganaRu, e: hiraganaRe, o: hiraganaRo },
    katakana: { a: katakanaRa, i: katakanaRi, u: katakanaRu, e: katakanaRe, o: katakanaRo },
  },
  {
    name: "わ行",
    hiragana: { a: hiraganaWa, i: hiraganaWa, u: hiraganaWa, e: hiraganaWo, o: hiraganaN },
    katakana: { a: katakanaWa, i: katakanaWa, u: katakanaWa, e: katakanaWo, o: katakanaN },
  },
];
