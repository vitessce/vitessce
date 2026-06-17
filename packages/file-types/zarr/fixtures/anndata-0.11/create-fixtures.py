import argparse
from pathlib import Path

import anndata
from anndata import AnnData
import numpy as np
import pandas as pd
from scipy import sparse

def create_zarr_anndata(output_dir, **kwargs):
    dtypes = ['int32', 'int64', 'float32']
    layers = dict(
        zip(
            dtypes, [
                np.array(
                    [np.arange(0, 15), np.arange(0, 15), np.arange(0, 15)], dtype=dtype
                ) for dtype in dtypes
            ]
        )
    )
    adata = AnnData(
        X=layers['float32'],
        obs=pd.DataFrame(index=["CTG", "GCA", "ACG"], data={"leiden": pd.Categorical(["1", "1", "2"])}),
        var=pd.DataFrame(index=[f"gene_{i}" for i in range(15)]),
        obsm={"X_umap": np.array([[-1, -1], [0, 0], [1, 1]], dtype=np.dtype('<i4'))},
        layers=layers
    )
    is_sparse = kwargs["is_sparse"]
    if is_sparse:
        is_csc = kwargs["is_csc"] if "is_csc" in kwargs else True
        if is_csc:
            adata.X = sparse.csc_matrix(adata.X)
            adata.write_zarr(output_dir / f'anndata-csc.zarr')
        else:
            adata.X = sparse.csr_matrix(adata.X)
            adata.write_zarr(output_dir / f'anndata-csr.adata.zarr')
    else:
        adata.write_zarr(output_dir / f'anndata-dense.zarr')


def main(output_dir):
    output_dir.mkdir(exist_ok=True)
    anndata.settings.allow_write_nullable_strings = True
    create_zarr_anndata(output_dir, is_sparse=True, is_csc=True)
    create_zarr_anndata(output_dir, is_sparse=True, is_csc=False)
    create_zarr_anndata(output_dir, is_sparse=False)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=f"""
            Creates a minimal anndata input fixture.
        """
    )
    parser.add_argument("dest", help="Directory where zarr files should be written", type=Path)
    args = parser.parse_args()
    main(args.dest)
