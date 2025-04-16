/**
   * A wrapper around HiGlass (http://higlass.io/).
   * The HiGlassComponent react component is loaded lazily.
   * @prop {object} hgViewConfig A HiGlass viewconfig object to pass
   * to the HiGlassComponent viewConfig prop.
   * @prop {object} hgOptions An optional HiGlass object to pass
   * to the HiGlassComponent hgOptions prop.
   * @prop {function} removeGridComponent A grid component removal handler
   * to pass to the TitleInfo component.
   * @prop {function} onReady A callback function to signal that the component is ready.
   */
declare function HiGlassLazy(props: any): JSX.Element;
declare namespace HiGlassLazy {
    namespace defaultProps {
        namespace hgOptions {
            let bounded: boolean;
            let pixelPreciseMarginPadding: boolean;
            let containerPaddingX: number;
            let containerPaddingY: number;
            let sizeMode: string;
        }
        let genomeSize: number;
    }
}
export default HiGlassLazy;
//# sourceMappingURL=HiGlassLazy.d.ts.map