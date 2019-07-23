import componentCss from '../css/component.module.scss';

export const TOOLTIP_ANCESTOR = 'tooltip-ancestor';
const CARD = `card card-body my-2 ${TOOLTIP_ANCESTOR}`;
export const BLACK_CARD = `${CARD} ${componentCss.bgBlack}`;
export const LIGHT_CARD = `${CARD} ${componentCss.bgLight}`;
export const TITLE_CARD = componentCss.title;
export const SCROLL_CARD = `${LIGHT_CARD} ${componentCss.scroll}`;
