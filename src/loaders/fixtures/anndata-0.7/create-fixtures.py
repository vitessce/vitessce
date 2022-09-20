import argparse
from pathlib import Path
from os import mkdir
from random import randint

from anndata import AnnData
import zarr
from numpy import array
from pandas import DataFrame
from scipy import sparse

X =array(
    [[randint(0, 1) * (1 + randint(0, 1) * .5) for i in range(15)], [randint(0, 1) * (1 + randint(0, 1) * .5) for i in range(15)], [randint(0, 1) * (1 + randint(0, 1) * .5) for i in range(15)]]
)

def create_zarr_anndata(output_dir, **kwargs):
    print(X)
    adata = AnnData(
        # Generate a fairly sparse matrix
        X=X,
        obs=DataFrame(index=["CTG", "GCA", "CTG"], data={"leiden": ["1", "1", "2"]}),
        var=DataFrame(index=[f"gene_{i}" for i in range(15)]),
        obsm={"X_umap": array([[-1, -1], [0, 0], [1, 1]])},
    )
    is_sprase = kwargs["is_sparse"]
    if is_sprase:
      # Default to True for CSC
      is_csc = kwargs["is_csc"] if "is_csc" in kwargs else True
      if is_csc:
        adata.X = sparse.csc_matrix(adata.X)
        adata.write_zarr(output_dir / 'anndata-csc.zarr')
      else:
        adata.X = sparse.csr_matrix(adata.X)
        adata.write_zarr(output_dir / 'anndata-csr.zarr')
    else:
      adata.write_zarr(output_dir / 'anndata-dense.zarr')


def main(output_dir):
    try:
        output_dir.mkdir(exist_ok=True)
    except FileExistsError:
        pass
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