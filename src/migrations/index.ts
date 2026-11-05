import * as migration_20261105_113243_initial from './20261105_113243_initial';

export const migrations = [
  {
    up: migration_20261105_113243_initial.up,
    down: migration_20261105_113243_initial.down,
    name: '20261105_113243_initial'
  },
];
