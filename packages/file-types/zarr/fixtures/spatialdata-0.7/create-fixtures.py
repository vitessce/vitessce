# /// script
# requires-python = ">=3.12"
# dependencies = [
#     'zarr>=3',
#     'anndata>=0.12.0',
#     'spatialdata==0.7.3',
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

    # Crop the object so that fixtures are smaller
    cropped_sdata = sdata.query.bounding_box(
        axes=["x", "y"],
        min_coordinate=[0, 0],
        max_coordinate=[100, 100],
        target_coordinate_system="global",
        filter_table=False
    )

    cropped_sdata.write(output_dir / 'blobs.sdata.zarr', overwrite=True)


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
