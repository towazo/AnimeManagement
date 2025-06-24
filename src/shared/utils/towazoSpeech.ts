// towazo の口調に変換するユーティリティ
export const convertToTowazoStyle = (text: string): string => {
  return text
    .replace(/です。/g, 'だよ。')
    .replace(/ます。/g, 'るよ。')
    .replace(/でしょう。/g, 'だと思う。')
    .replace(/おすすめします/g, 'おすすめするよ')
    .replace(/いかがでしょうか/g, 'どうかな？')
    .replace(/ください/g, 'してね')
    .replace(/^/, 'towazoだよ！ ');
};
