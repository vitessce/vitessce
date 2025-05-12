export class ColorHelper {
   public static lightenDarkenColorString(color: string, amt: number) {
      let usePound = false;
      if (color[0] == '#') {
         color = color.slice(1);
         usePound = true;
      }

      let num = parseInt(color, 16);
      num = this.lightenDarkenColor(num, amt);
      return (usePound ? '#' : '') + num.toString(16);
   }

   public static lightenDarkenColor(num: number, amt: number) {
      let r = (num >> 16) + amt;

      if (r > 255) r = 255;
      else if (r < 0) r = 0;

      let b = ((num >> 8) & 0x00ff) + amt;

      if (b > 255) b = 255;
      else if (b < 0) b = 0;

      let g = (num & 0x0000ff) + amt;

      if (g > 255) g = 255;
      else if (g < 0) g = 0;
      return g | (b << 8) | (r << 16);
   }
}
