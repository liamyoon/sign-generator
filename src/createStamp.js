const getFont = require('./getFont');
const {
  BOX_HEIGHT,
  BOX_TAG_ST,
  BOX_TAG_END,
  BOX_WIDTH,
  TEXT_SIZE,
  FONT_LIST,
  SIGN_TYPE,
  CHAR_HEIGHT,
} = require('./type/stamp.type');

/**
 * 날짜 : 2020.01.07
 * 내용 : border 생성 함수
 */
function createBorder(size, type, height, width, option = { stroke: '#ff0000', strokeWidth: '2.3' }) {
  let border = '';
  if (type === SIGN_TYPE.CIRCLE && size % 2 === 0) {
    // 원형
    border = `<circle fill="none" stroke="${option.stroke}" stroke-width="${option.strokeWidth}" cx="61" cy="61" r="30"></circle>`;
  } else if (type === SIGN_TYPE.CIRCLE) {
    // 타원형
    border = `<ellipse fill="none" stroke="${option.stroke}" stroke-width="${option.strokeWidth}" cx="61" cy="61" rx="${CHAR_HEIGHT}" ry="${(size + 1) * 10}"></ellipse>`;
  } else if (type === SIGN_TYPE.RECT) {
    const x = (BOX_WIDTH - width) / 2;
    const y = (BOX_HEIGHT - height) / 2;
    // 사각형
    border = `<rect fill="none" stroke="${option.stroke}" stroke-width="${option.strokeWidth}" x="${x}" y="${y}" width="${width}" height="${height}"></rect>`;
  } else {
    // error
    throw new Error('invalid parameters');
  }
  return border;
}

/**
 * 날짜 : 2020.01.07
 * 내용 : 도장 생성 함수
 */
async function stampGenerator(text, font, type, col, row, attributes = { fill: 'red' }, borderOption) {
  // get font
  const textToSVG = await getFont(font);
  const height = row * CHAR_HEIGHT;
  const middle = BOX_HEIGHT - height;
  const items = [];
  let top = 0, // top 좌표값
    left = 0, // left 좌표값
    text_index = 0, // text index
    left_index = 0; // row index
  for (let i = 0; i < row; i++) {
    if (!top) top = Math.round(middle / 2); // 중앙 위치값
    else top = top + CHAR_HEIGHT; // 루프마다 문자열 크기만큼 위치를 지정
    left = 0; // 매 루프 시작 시 left 값을 initialize
    for (let j = 0; j < col; j++) {
      if (!left) left = (BOX_WIDTH - (CHAR_HEIGHT * col)) / 2; // 초기값 지정
      else left = left + CHAR_HEIGHT; // 루프마다 문자열 크기만큼 위치를 지정
      const t_value = text.charAt(text_index);
      // 문자열 위치 지정
      const options = { x: left, y: top, fontSize: CHAR_HEIGHT, anchor: 'top left', attributes: attributes };
      items.push(textToSVG.getPath(t_value, options));
      text_index++;
    }
    left_index++;
  }
  const border = createBorder(text.length, type, CHAR_HEIGHT * row + 10, CHAR_HEIGHT * col + 10, borderOption);
  return `
    ${BOX_TAG_ST}
      ${border}
      ${items.join('\n')}
    ${BOX_TAG_END}
  `;
}

/**
 * 날짜 : 2020.01.07
 * 내용 : 도장 생성 main
 * @param text
 * @param options {{font: string[]}}
 * @param options.attributes {object}
 * @param options.borderOption {object}
 * @param options.borderOption.stroke {string} : required * 사용시 두값 모두 필수입력
 * @param options.borderOption.strokeWidth {number} : required * 사용시 두값 모두 필수입력
 */
async function createStamp(text, options = {}) {
  const { attributes, borderOption, font } = options;
  const text_size = text.length;

  // text 크기는 최소 1자 ~ 9자 까지.
  if (!text_size || (text_size < 0 || text_size > 9)) throw new Error('invalid parameter: text(min: 1, max: 9)');
  if (!!font && typeof font === 'object' && !Array.isArray(font)) throw new Error('invalid parameter: font');

  // text 크기에 해당하는 생성 리스트를 가져옴
  const createFunc = TEXT_SIZE[text_size];
  const data = createFunc(text); // 생성 리스트

  const stamp_list = [];
  for (let i = 0; i < data.length; i++) {
    const { type, col, row, word } = data[i]; // 생성해야할 text info
    let fonts = [];

    // 폰트 정보가 있는 경우 해당 도장만 생성.
    switch (typeof font) {
      case 'object': fonts = font; break;
      case 'string': fonts = [font]; break;
      default: fonts = FONT_LIST; break;
    }

    // 등록된 폰트의 갯수만큼 루프
    for (let j = 0; j < fonts.length; j++) {
      // 도장 생성
      const stamp = await stampGenerator(word, fonts[j], type, col, row, attributes, borderOption);
      stamp_list.push(stamp); // 배열에 저장
    }
  }
  return stamp_list;
}

module.exports = createStamp;