import * as migration_20261105_113243_initial from './20261105_113243_initial';
import * as migration_20261105_233500_navigation from './20261105_233500_navigation';

export const migrations = [
  {
    up: migration_20261105_113243_initial.up,
    down: migration_20261105_113243_initial.down,
    name: '20261105_113243_initial',
  },
  {
    up: migration_20261105_233500_navigation.up,
    down: migration_20261105_233500_navigation.down,
    name: '20261105_233500_navigation'
  },
];
