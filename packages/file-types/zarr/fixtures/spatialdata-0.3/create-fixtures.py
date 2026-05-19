# /// script
# requires-python = ">=3.11"
# dependencies = [
#     'scipy>=1.2.1',
#     'pandas>=1.1.2',
#     'numpy>=1.21.2',
#     'zarr>=2.5.0,<3',
#     'numcodecs>=0.5.7,<0.16.0',
#     'scanpy>=1.11.3',
#     'anndata>=0.11.4',
#     'spatialdata==0.3.0',
#     "xarray>=2024.10.0,<=2025.3.0",
#     'dask[dataframe]==2024.11.1',
#     'distributed<=2024.11.2',
#     'setuptools<75',
# ]
# ///

import argparse
from pathlib import Path

import spatialdata
from anndata import AnnData
import pandas as pd

def create_blobs_spatialdata(output_dir):
    sdata = spatialdata.datasets.blobs()

    # Create a Table with a var dataframe corresponding to the genes column of the Points table
    ddf = sdata.points['blobs_points']

    # We need to create another table which has a var.index column containing the gene IDs for the points.
    unique_gene_ids = ddf["genes"].unique().compute().tolist()
    points_var_df = pd.DataFrame(index=unique_gene_ids, data=[], columns=[])
    points_table = AnnData(var=points_var_df, obs=None, X=None)
    sdata.tables['table_points'] = points_table

    # Remove blobs_image - keep only the multiscale image
    del sdata["blobs_image"]

    sdata.write(output_dir / 'blobs.sdata.zarr', overwrite=True)


def main(output_dir):
    output_dir.mkdir(exist_ok=True)
    create_blobs_spatialdata(output_dir)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=f"""
            Creates a minimal spatialdata input fixture.
        """
    )
    parser.add_argument("dest", help="Directory where zarr files should be written", type=Path)
    args = parser.parse_args()
    main(args.dest)
