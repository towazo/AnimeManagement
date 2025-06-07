/**
 * アニメの略称と正式名称のマッピング
 * キー: 略称
 * 値: 正式名称
 */
export const animeAliases: Record<string, string> = {
  // 人気アニメの略称
  '俺ガイル': 'やはり俺の青春ラブコメは間違っている',
  'oregairu': 'やはり俺の青春ラブコメは間違っている',
  'おれがいる': 'やはり俺の青春ラブコメは間違っている',
  '青ブタ': '青春ブタ野郎はバニーガール先輩の夢を見ない',
  'aobuta': '青春ブタ野郎はバニーガール先輩の夢を見ない',
  'あおぶた': '青春ブタ野郎はバニーガール先輩の夢を見ない',
  '鬼滅': '鬼滅の刃',
  'kimetsu': '鬼滅の刃',
  'きめつ': '鬼滅の刃',
  '進撃': '進撃の巨人',
  'shingeki': '進撃の巨人',
  'しんげき': '進撃の巨人',
  'リゼロ': 'Re:ゼロから始める異世界生活',
  'rezero': 'Re:ゼロから始める異世界生活',
  'SAO': 'ソードアート・オンライン',
  'sao': 'ソードアート・オンライン',
  'ソードアート': 'ソードアート・オンライン',
  '五等分': '五等分の花嫁',
  'gotobun': '五等分の花嫁',
  'ごとうぶん': '五等分の花嫁',
  'このすば': 'この素晴らしい世界に祝福を！',
  'konosuba': 'この素晴らしい世界に祝福を！',
  'ハイキュー': 'ハイキュー!!',
  'haikyu': 'ハイキュー!!',
  'はいきゅー': 'ハイキュー!!',
  '物語シリーズ': '化物語',
  'monogatari': '化物語',
  'ものがたり': '化物語',
  'ジョジョ': 'ジョジョの奇妙な冒険',
  'jojo': 'ジョジョの奇妙な冒険',
  'じょじょ': 'ジョジョの奇妙な冒険',
  'ヒロアカ': '僕のヒーローアカデミア',
  'hiroaka': '僕のヒーローアカデミア',
  'ひろあか': '僕のヒーローアカデミア',
  'ぼくあか': '僕のヒーローアカデミア',
  'ワートリ': 'ワールドトリガー',
  'worldtrigger': 'ワールドトリガー',
  'わーとり': 'ワールドトリガー',
  'かぐや様': 'かぐや様は告らせたい～天才たちの恋愛頭脳戦～',
  'kaguyasama': 'かぐや様は告らせたい～天才たちの恋愛頭脳戦～',
  'かぐやさま': 'かぐや様は告らせたい～天才たちの恋愛頭脳戦～',
  'ゆるキャン': 'ゆるキャン△',
  'yurucamp': 'ゆるキャン△',
  'ゆるきゃん': 'ゆるキャン△',
  'のんのん': 'のんのんびより',
  'nonnonbiyori': 'のんのんびより',
  'のんのんびより': 'のんのんびより',
  'ごちうさ': 'ご注文はうさぎですか？',
  'gochiusa': 'ご注文はうさぎですか？',
  'シュタゲ': 'STEINS;GATE',
  'steinsgate': 'STEINS;GATE',
  'シュタインズゲート': 'STEINS;GATE',
  'しゅたげ': 'STEINS;GATE',
  'ダンまち': 'ダンジョンに出会いを求めるのは間違っているだろうか',
  'danmachi': 'ダンジョンに出会いを求めるのは間違っているだろうか',
  'だんまち': 'ダンジョンに出会いを求めるのは間違っているだろうか',
};

/**
 * 略称から正式名称を取得する
 * @param title 検索するタイトル（略称または正式名称）
 * @returns 正式名称が見つかった場合はその名称、見つからなかった場合は元の入力
 */
export const getOfficialTitle = (title: string): string => {
  // 入力が空の場合はそのまま返す
  if (!title) return title;
  
  // 完全一致で略称を検索
  if (animeAliases[title]) {
    return animeAliases[title];
  }
  
  // 小文字化して検索（大文字小文字を区別しない）
  const lowerTitle = title.toLowerCase();
  for (const [alias, official] of Object.entries(animeAliases)) {
    if (alias.toLowerCase() === lowerTitle) {
      return official;
    }
  }
  
  // 略称が見つからなかった場合は元の入力を返す
  return title;
};

/**
 * 検索用に正規化したタイトルを取得する
 * @param title タイトル
 * @returns 正規化されたタイトル
 */
export const normalizeForSearch = (title: string): string => {
  // 入力が空の場合はそのまま返す
  if (!title) return title;
  
  // 類似漢字のマッピング表
  const similarKanjiMap: Record<string, string> = {
    '嘘': '噂', // 嘘(官常用漢字の「嘘」) -> 噂(異体字の「噂」)
    '噂': '嘘', // 噂(異体字の「噂」) -> 嘘(官常用漢字の「嘘」)
    '浄': '浜', // 浄 -> 浜
    '浜': '浄', // 浜 -> 浄
    '会': '會', // 会 -> 會
    '會': '会', // 會 -> 会
    '学': '學', // 学 -> 學
    '學': '学'  // 學 -> 学
  };
  
  // 類似漢字を標準化
  let normalized = title.toLowerCase();
  for (const [from, to] of Object.entries(similarKanjiMap)) {
    normalized = normalized.replace(new RegExp(from, 'g'), to);
  }
  
  return normalized
    .replace(/\s+/g, '') // 空白文字を除去
    .replace(/[\u3000\s\t\n\r]/g, '') // 全角空白やタブ、改行を除去
    .replace(/[\!\?\u3001\u3002\uff01\uff1f]/g, '') // 句読点や特殊文字を除去
    .trim();
};
