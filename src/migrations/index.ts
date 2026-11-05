import * as migration_20261105_075726_initial from './20261105_075726_initial';

export const migrations = [
  {
    up: migration_20261105_075726_initial.up,
    down: migration_20261105_075726_initial.down,
    name: '20261105_075726_initial'
  },
];
