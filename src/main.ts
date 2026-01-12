import { g } from 'genshin-ts/runtime/core'

const GRAPH_ID = 1073741825
const SIGNAL_ROUND_START = 'RoundStart'
const SIGNAL_TICK = 'Tick'
const SIGNAL_ROUND_END = 'RoundEnd'
const SIGNAL_TANK_HIT = 'TankHit'

g.server({
  id: GRAPH_ID,
  name: 'TankTroubleRoot',
  variables: {
    state: 0n, // 0=Boot, 1=WaitingPlayers, 2=RoundRunning, 3=RoundEnd
    aliveCount: 0n,
    roundTimeMs: 0,
    tickMs: 120,
    tickStarted: false,
    scoreP1: 0n,
    scoreP2: 0n,
    rngSeed: 1n,
    mapBoundsMin: [0, 0, 0],
    mapBoundsMax: [0, 0, 0],
    spawnPoints: list('vec3', []),
    powerupEnabled: true
  }
})
  .on('whenEntityIsCreated', (_evt, f) => {
    f.set('state', 0n)
    f.set('aliveCount', 0n)
    f.set('roundTimeMs', 0)

    if (!f.get('tickStarted')) {
      const intervalMs = f.get('tickMs')
      setInterval(() => send(SIGNAL_TICK), intervalMs)
      f.set('tickStarted', true)
    }

    f.set('state', 1n)
    send(SIGNAL_ROUND_START)
  })
  .onSignal(SIGNAL_ROUND_START, (_evt, f) => {
    f.set('state', 2n)
    f.set('aliveCount', 2n)
    f.set('roundTimeMs', 0)

    gstsServerSpawnTank(1n)
    gstsServerSpawnTank(2n)
  })
  .onSignal(SIGNAL_TICK, (_evt, f) => {
    if (f.get('state') === 2n) {
      const t = f.get('roundTimeMs') + f.get('tickMs')
      f.set('roundTimeMs', t)

      gstsServerUpdateTank(1n)
      gstsServerUpdateTank(2n)
      gstsServerUpdateBullets()

      if (f.get('aliveCount') <= 1n) {
        send(SIGNAL_ROUND_END)
      }
    }
  })
  .onSignal(SIGNAL_TANK_HIT, (_evt, f) => {
    const alive = f.get('aliveCount') - 1n
    f.set('aliveCount', alive)
  })
  .onSignal(SIGNAL_ROUND_END, (_evt, f) => {
    f.set('state', 3n)
    setTimeout(() => send(SIGNAL_ROUND_START), 2000)
  })

function gstsServerSpawnTank(playerId: bigint) {
  const f = gsts.f
  f.printString(str(playerId))
  return 0n
}

function gstsServerUpdateTank(_playerId: bigint) {
  return 0n
}

function gstsServerUpdateBullets() {
  return 0n
}
