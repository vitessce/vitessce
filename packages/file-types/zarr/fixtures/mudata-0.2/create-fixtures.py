import argparse
from pathlib import Path
from os import mkdir
from random import randint

from anndata import AnnData
from mudata import MuData
import zarr
import numpy as np
from pandas import DataFrame
from scipy import sparse

np.random.seed(10)

def int32array(args):
  return np.array(args).astype(np.dtype('<i4'))

X = int32array(
    [
        [randint(0, 1) * (1 + randint(0, 1) * .5) for i in range(15)],
        [randint(0, 1) * (1 + randint(0, 1) * .5) for i in range(15)],
        [randint(0, 1) * (1 + randint(0, 1) * .5) for i in range(15)],
        [randint(0, 1) * (1 + randint(0, 1) * .5) for i in range(15)],
    ]
)

def create_zarr_mudata(output_dir, **kwargs):
    print(X)
    rna = AnnData(
        # Generate a fairly sparse matrix
        X=X,
        obs=DataFrame(index=["CTG", "GCA", "CTT", "AAA"], data={"leiden": ["1", "1", "2", "2"]}),
        var=DataFrame(index=[f"gene_{i}" for i in range(15)]),
        obsm={"X_umap": int32array([[-1, -1], [0, 0], [1, 1], [1, 2]])},
    )
    atac = AnnData(
        X=X,
        obs=DataFrame(index=["CTG", "GCA", "CTT", "GGG"], data={"leiden": ["2", "2", "1", "1"]}),
        var=DataFrame(index=[f"peak_{i}" for i in range(15)]),
        obsm={"X_lsi": int32array([[-2, -2], [0, 0], [2, 2], [2, 1]])},
    )
    is_sparse = kwargs["is_sparse"]
    run_update = kwargs["run_update"] if "run_update" in kwargs else False
    if is_sparse:
        # Default to True for CSC
        is_csc = kwargs["is_csc"] if "is_csc" in kwargs else True
        if is_csc:
            rna.X = sparse.csc_matrix(rna.X)
            out_filepath = output_dir / 'mudata-csc.zarr'
        else:
            rna.X = sparse.csr_matrix(rna.X)
            out_filepath = output_dir / 'mudata-csr.zarr'
    else:
        if run_update:
            out_filepath = output_dir / 'mudata-dense-updated.zarr'
        else:
            out_filepath = output_dir / 'mudata-dense.zarr'
    mdata = MuData({ 'rna': rna, 'atac': atac })

    mdata.obsm = {"X_mofa": int32array([[-1, -2], [3, 4], [5, 6], [5, 3], [4, 4]])}
    mdata.obs = DataFrame(index=["CTG", "GCA", "CTT", "AAA", "GGG"], data={"leiden": ["3", "2", "3", "1", "1"]})

    if run_update:
        mdata.update()
    mdata.write_zarr(out_filepath)

def main(output_dir):
    try:
        output_dir.mkdir(exist_ok=True)
    except FileExistsError:
        pass
    create_zarr_mudata(output_dir, is_sparse=True, is_csc=True)
    create_zarr_mudata(output_dir, is_sparse=True, is_csc=False)
    create_zarr_mudata(output_dir, is_sparse=False)
    create_zarr_mudata(output_dir, is_sparse=False, run_update=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=f"""
            Creates a minimal anndata input fixture.
        """
    )
    parser.add_argument("dest", help="Directory where zarr files should be written", type=Path)
    args = parser.parse_args()
    main(args.dest)