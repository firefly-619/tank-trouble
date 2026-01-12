import type { GstsConfig } from 'genshin-ts'

const config: GstsConfig = {
  compileRoot: '.',
  entries: ['./src'],
  outDir: './dist'
  // inject: {
  //   gameRegion: 'China',
  //   playerId: 1,
  //   mapId: 1073741849,
  //   nodeGraphId: 1073741825
  // }
}

export default config
