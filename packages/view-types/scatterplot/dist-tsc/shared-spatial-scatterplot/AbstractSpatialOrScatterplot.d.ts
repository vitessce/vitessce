/**
 * Abstract class component intended to be inherited by
 * the Spatial and Scatterplot class components.
 * Contains a common constructor, common DeckGL callbacks,
 * and common render function.
 */
export default class AbstractSpatialOrScatterplot {
    constructor(props: any);
    state: {
        gl: null;
        tool: null;
    };
    viewport: object | null;
    /**
     * Called by DeckGL upon a viewState change,
     * for example zoom or pan interaction.
     * Emit the new viewState to the `setViewState`
     * handler prop.
     * @param {object} params
     * @param {object} params.viewState The next deck.gl viewState.
     */
    onViewStateChange({ viewState: nextViewState }: {
        viewState: object;
    }): void;
    /**
     * Called by DeckGL upon viewport
     * initialization.
     * @param {object} viewState
     * @param {object} viewState.viewport
     */
    onInitializeViewInfo({ viewport }: {
        viewport: object;
    }): void;
    /**
     * Called by DeckGL upon initialization,
     * helps to understand when to pass layers
     * to the DeckGL component.
     * @param {object} gl The WebGL context object.
     */
    onWebGLInitialized(gl: object): void;
    /**
     * Called by the ToolMenu buttons.
     * Emits the new tool value to the
     * `onToolChange` prop.
     * @param {string} tool Name of tool.
     */
    onToolChange(tool: string): void;
    onHover(info: any): null | undefined;
    /** Intended to be overridden by descendants.
     * Resets the view type to its original position.
    */
    recenter(): void;
    /**
     * Create the DeckGL layers.
     * @returns {object[]} Array of
     * DeckGL layer objects.
     * Intended to be overriden by descendants.
     */
    getLayers(): object[];
    /**
     * Emits a function to project from the
     * cell ID space to the scatterplot or
     * spatial coordinate space, via the
     * `updateViewInfo` prop.
     */
    viewInfoDidUpdate(obsIndex: any, obsLocations: any, makeGetObsCoords: any): void;
    /**
     * Intended to be overridden by descendants.
     */
    componentDidUpdate(): void;
    /**
     * Intended to be overridden by descendants.
     * @returns {boolean} Whether or not any layers are 3D.
     */
    use3d(): boolean;
    /**
     * A common render function for both Spatial
     * and Scatterplot components.
     */
    render(): JSX.Element;
}
//# sourceMappingURL=AbstractSpatialOrScatterplot.d.ts.map