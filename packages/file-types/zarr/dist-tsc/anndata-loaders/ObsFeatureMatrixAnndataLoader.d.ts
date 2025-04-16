/**
 * Loader for converting zarr into the a cell x gene matrix for use in Genes/Heatmap components.
 */
export default class ObsFeatureMatrixAnndataLoader extends AbstractTwoStepLoader<any> {
    constructor(dataSource: any, params: import("@vitessce/types").LoaderParams);
    getOptions(): any;
    /**
     * Class method for loading the genes list from AnnData.var,
     * filtered if a there is a `geneFilterZarr` present in the view config.
     * @returns {Promise} A promise for the zarr array contianing the gene names.
     */
    loadFilteredGeneNames(): Promise<any>;
    filteredGeneNames: Promise<any> | undefined;
    /**
     * Class method for loading a filtered subset of the genes list
     * @param {String} filterZarr A location in the zarr store to fetch a boolean array from.
     * @returns {Array} A list of filtered genes.
     */
    _getFilteredGenes(filterZarr: string): any[];
    /**
     * Class method for getting the integer indices of a selection of genes within a list.
     * @param {Array} selection A list of gene names.
     * @returns {Array} A list of integer indices.
     */
    _getGeneIndices(selection: any[]): any[];
    /**
     * Class method for getting the number of cells i.e entries in `obs`.
     * @returns {Number} The number of cells.
     */
    _getNumCells(): number;
    /**
     * Class method for getting the number of genes i.e entries in `var`,
     * potentially filtered by `genesFilter`.
     * @returns {Number} The number of genes.
     */
    _getNumGenes(): number;
    /**
     * Class method for opening the sparse matrix arrays in zarr.
     * @returns {Array} A list of promises pointing to the indptr, indices, and data of the matrix.
     */
    _openSparseArrays(): any[];
    sparseArrays: Promise<import("zarrita").Array<import("zarrita").DataType, any>[]> | undefined;
    /**
     * Class method for loading a gene selection from a CSC matrix.
     * @param {Array} selection A list of gene names whose data should be fetched.
     * @returns {Promise} A Promise.all array of promises containing Uint8Arrays, one per selection.
     */
    _loadCSCGeneSelection(selection: any[]): Promise<any>;
    /**
     * Class method for loading a gene selection from a CSR matrix.
     * @param {Array} selection A list of gene names whose data should be fetched.
     * @returns {Promise} A Promise.all array of promises containing Uint8Arrays, one per selection.
     */
    _loadCSRGeneSelection(selection: any[]): Promise<any>;
    /**
     * Class method for loading row oriented (CSR) sparse data from zarr.
     *
     * @returns {Object} A { data: Float32Array } contianing the CellXGene matrix.
     */
    _loadCSRSparseCellXGene(): Object;
    _sparseMatrix: any;
    /**
     * Class method for loading column oriented (CSC) sparse data from zarr.
     * @returns {Object} A { data: Float32Array } contianing the CellXGene matrix.
     */
    _loadCSCSparseCellXGene(): Object;
    /**
     * Class method for loading the cell x gene matrix.
     * @returns {Promise} A promise for the zarr array contianing the cell x gene data.
     */
    loadCellXGene(): Promise<any>;
    _matrixZattrs: any;
    cellXGene: any;
    arr: Promise<import("zarrita").Array<import("zarrita").DataType, any>> | undefined;
    /**
     * Class method for loading a gene selection.
     * @param {Object} args
     * @param {Array} args.selection A list of gene names whose data should be fetched.
     * @returns {Object} { data } containing an array of gene expression data.
     */
    loadGeneSelection({ selection }: {
        selection: any[];
    }): Object;
    /**
     * Class method for loading only attributes i.e rows and columns
     * @param {Array} selection A list of gene names whose data should be fetched.
     * @returns {Object} { data: { rows, cols }, url } containing row and col labels for the matrix.
     */
    loadAttrs(): Object;
    loadInitialFilteredGeneNames(): Promise<any>;
    load(): Promise<LoaderResult<{
        obsIndex: any;
        featureIndex: any;
        obsFeatureMatrix: any;
    }>>;
}
import { AbstractTwoStepLoader } from '@vitessce/vit-s';
import { LoaderResult } from '@vitessce/vit-s';
//# sourceMappingURL=ObsFeatureMatrixAnndataLoader.d.ts.map