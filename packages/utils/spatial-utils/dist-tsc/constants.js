import { viv } from '@vitessce/gl';
function getDomains() {
    const domains = {};
    const needMin = ['Int8', 'Int16', 'Int32'];
    Object.keys(viv.DTYPE_VALUES).forEach((dtype) => {
        const { max } = viv.DTYPE_VALUES[dtype];
        const min = needMin.includes(dtype) ? -(max + 1) : 0;
        domains[dtype] = [min, max];
    });
    return domains;
}
export const DOMAINS = getDomains();
