export function listConfigs(datasets, showAll) {
  return Object.entries(datasets).filter(
    entry => showAll || entry[1].public,
  ).map(
    ([id, config]) => ({
      id,
      name: config.name,
      description: config.description,
      files: 'datasets' in config ? config.datasets[0].files : config.layers,
    }),
  );
}

export function getConfig(configs, id) {
  return configs[id];
}
