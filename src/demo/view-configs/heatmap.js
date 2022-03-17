/* eslint-disable */

const linnarssonName = "Heatmap";
const linnarssonDescription = "Demo for heatmap development";
const linnarssonBase = {
  name: "heatmap",
  description: "",
  version: "1.0.6",
  initStrategy: "auto",
  datasets: [
    {
      uid: "test",
      name: "Test",
      files: [
        {
          url: "",
          type: "expression-matrix",
          fileType: "in-memory-matrix",
        },
      ],
    },
  ],
};

export const heatmapOnly = {
  ...linnarssonBase,
  public: true,
  coordinationSpace: {},
  layout: [
    {
      component: "description",
      props: {
        description: `${linnarssonName}: ${linnarssonDescription}`,
      },
      x: 0,
      y: 0,
      w: 2,
      h: 6,
    },

    {
      component: "status",
      x: 0,
      y: 6,
      w: 2,
      h: 6,
    },
    {
      component: "heatmap",
      x: 2,
      y: 0,
      w: 10,
      h: 12,
    },
  ],
};
