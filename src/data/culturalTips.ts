export const culturalTips = [
  "The qeleshe is a traditional Albanian hat worn in the north, often made of white felt.",
  "Besa is the Albanian code of honor meaning 'to keep one's word' - it's central to Albanian culture.",
  "The double-headed eagle on Albania's flag represents the north and south of the country.",
  "Raki is a traditional Albanian spirit, often served to guests as a sign of hospitality.",
  "The fustanella is a traditional kilt-like garment worn by men in southern Albania.",
  "Albanian is one of the oldest languages in Europe, forming its own branch of Indo-European.",
  "The xhubleta is a traditional bell-shaped dress worn by women in northern Albania.",
  "Coffee culture is huge in Albania - people spend hours socializing in cafes.",
  "Albanians nod their head down for 'yes' and shake it side to side for 'no' - opposite to most cultures.",
  "The traditional Albanian vest (jelek) is often embroidered with intricate patterns and colors.",
  "Skanderbeg is Albania's national hero who defended the country against Ottoman invasion.",
  "The plis is a white traditional hat from northern Albania, symbol of Albanian identity.",
  "Albanian traditional music includes epic ballads called 'këngë kreshnikësh'.",
  "The dimije are traditional loose trousers worn under dresses in Albanian folk costume.",
  "Byrek is a beloved traditional pastry filled with cheese, spinach, or meat.",
  "The opinga are traditional leather shoes with pointed, curled toes.",
  "Albanian wedding traditions include the 'ora' - a circle dance performed by all guests.",
  "The tambourine (dajre) and clarinet (kllarineta) are central to Albanian folk music.",
  "Traditional Albanian houses often have a 'oda' - a special room for receiving guests.",
  "The Albanian alphabet has 36 letters and was standardized in 1908.",
  "Red and black are the traditional colors of Albania, representing bravery and strength.",
  "The çifteli is a traditional two-stringed Albanian musical instrument.",
  "Albanian hospitality is legendary - guests are treated as sacred.",
  "The traditional Albanian cap (kapela) varies by region but always shows local identity."
];

export const getRandomTip = (): string => {
  return culturalTips[Math.floor(Math.random() * culturalTips.length)];
};