import { g } from 'genshin-ts/runtime/core'

// ============================================================================
// ============================================================================

const GRAPH_ID = 1073741825

const SIGNAL_ROUND_START = 'RoundStart'
const SIGNAL_TICK = 'Tick'
const SIGNAL_ROUND_END = 'RoundEnd'
const SIGNAL_TANK_HIT = 'TankHit'

const SIGNAL_P1_UP = 'P1Up'
const SIGNAL_P1_DOWN = 'P1Down'
const SIGNAL_P1_LEFT = 'P1Left'
const SIGNAL_P1_RIGHT = 'P1Right'
const SIGNAL_P1_FIRE = 'P1Fire'

const SIGNAL_P2_UP = 'P2Up'
const SIGNAL_P2_DOWN = 'P2Down'
const SIGNAL_P2_LEFT = 'P2Left'
const SIGNAL_P2_RIGHT = 'P2Right'
const SIGNAL_P2_FIRE = 'P2Fire'

const SIGNAL_MODE_PVE = 'ModePvE'
const SIGNAL_MODE_PVP = 'ModePvP'

g.server({
  id: GRAPH_ID,
  name: 'TankTrouble2D',
  variables: {
    gameMode: 0n,
    state: 0n,
    aliveCount: 0n,
    tickStarted: false,
    scoreP1: 0n,
    scoreP2: 0n,

    t1x: -10.0,
    t1z: 0.0,
    t1dirX: 1.0,
    t1dirZ: 0.0,
    t1alive: true,
    t1inputX: 0n,
    t1inputZ: 0n,
    t1wantFire: false,
    t1shield: 0n,
    t1speed: 0n,
    t1bounce: 0n,

    t2x: 10.0,
    t2z: 0.0,
    t2dirX: -1.0,
    t2dirZ: 0.0,
    t2alive: true,
    t2inputX: 0n,
    t2inputZ: 0n,
    t2wantFire: false,
    t2shield: 0n,
    t2speed: 0n,
    t2bounce: 0n,

    bActive: false,
    bx: 0.0,
    bz: 0.0,
    bdirX: 1.0,
    bdirZ: 0.0,
    bBounces: 0n,
    bOwner: 0n,

    pw1Active: false,
    pw1X: 0.0,
    pw1Z: 0.0,
    pw1Type: 0n,
    pw2Active: false,
    pw2X: 0.0,
    pw2Z: 0.0,
    pw2Type: 0n,
    pwTimer: 0n,

    seed: 12345n
  }
})
  .on('whenEntityIsCreated', (_evt, f) => {
    f.printString('Tank Trouble 2D: Init')
    f.set('state', 1n)

    if (!f.get('tickStarted')) {
      setInterval(() => {
        send(SIGNAL_TICK)
      }, 150)
      f.set('tickStarted', true)
    }
  })

  .onSignal(SIGNAL_MODE_PVE, (_evt, f) => {
    f.set('gameMode', 0n)
    f.printString('Mode: PvE')
    send(SIGNAL_ROUND_START)
  })

  .onSignal(SIGNAL_MODE_PVP, (_evt, f) => {
    f.set('gameMode', 1n)
    f.printString('Mode: PvP')
    send(SIGNAL_ROUND_START)
  })

  .onSignal(SIGNAL_P1_UP, (_evt, f) => { f.set('t1inputZ', -1n) })
  .onSignal(SIGNAL_P1_DOWN, (_evt, f) => { f.set('t1inputZ', 1n) })
  .onSignal(SIGNAL_P1_LEFT, (_evt, f) => { f.set('t1inputX', -1n) })
  .onSignal(SIGNAL_P1_RIGHT, (_evt, f) => { f.set('t1inputX', 1n) })
  .onSignal(SIGNAL_P1_FIRE, (_evt, f) => { f.set('t1wantFire', true) })

  .onSignal(SIGNAL_P2_UP, (_evt, f) => { f.set('t2inputZ', -1n) })
  .onSignal(SIGNAL_P2_DOWN, (_evt, f) => { f.set('t2inputZ', 1n) })
  .onSignal(SIGNAL_P2_LEFT, (_evt, f) => { f.set('t2inputX', -1n) })
  .onSignal(SIGNAL_P2_RIGHT, (_evt, f) => { f.set('t2inputX', 1n) })
  .onSignal(SIGNAL_P2_FIRE, (_evt, f) => { f.set('t2wantFire', true) })

  .onSignal(SIGNAL_ROUND_START, (_evt, f) => {
    f.printString('Round Start!')
    f.set('state', 2n)
    f.set('aliveCount', 2n)

    f.set('t1x', -10.0)
    f.set('t1z', 0.0)
    f.set('t1dirX', 1.0)
    f.set('t1dirZ', 0.0)
    f.set('t1alive', true)
    f.set('t1shield', 0n)
    f.set('t1speed', 0n)
    f.set('t1bounce', 0n)

    f.set('t2x', 10.0)
    f.set('t2z', 0.0)
    f.set('t2dirX', -1.0)
    f.set('t2dirZ', 0.0)
    f.set('t2alive', true)
    f.set('t2shield', 0n)
    f.set('t2speed', 0n)
    f.set('t2bounce', 0n)

    f.set('bActive', false)
    f.set('pw1Active', false)
    f.set('pw2Active', false)
    f.set('pwTimer', 20n)
  })

  .onSignal(SIGNAL_TICK, (_evt, f) => {
    if (f.get('state') === 2n) {
      const seed = f.get('seed')
      const newSeed = (seed * 1103515245n + 12345n) % 2147483648n
      f.set('seed', newSeed)

      const gameMode = f.get('gameMode')

      if (f.get('t1alive')) {
        let x1 = f.get('t1x')
        let z1 = f.get('t1z')
        const inputX = f.get('t1inputX')
        const inputZ = f.get('t1inputZ')
        const hasSpeed = f.get('t1speed') > 0n

        let moveSpd = 0.5
        if (hasSpeed) {
          moveSpd = 0.8
        }

        if (inputX === -1n) {
          x1 = x1 - moveSpd
          f.set('t1dirX', -1.0)
          f.set('t1dirZ', 0.0)
        }
        if (inputX === 1n) {
          x1 = x1 + moveSpd
          f.set('t1dirX', 1.0)
          f.set('t1dirZ', 0.0)
        }
        if (inputZ === -1n) {
          z1 = z1 - moveSpd
          f.set('t1dirX', 0.0)
          f.set('t1dirZ', -1.0)
        }
        if (inputZ === 1n) {
          z1 = z1 + moveSpd
          f.set('t1dirX', 0.0)
          f.set('t1dirZ', 1.0)
        }

        if (x1 < -20.0) x1 = -20.0
        if (x1 > 20.0) x1 = 20.0
        if (z1 < -15.0) z1 = -15.0
        if (z1 > 15.0) z1 = 15.0

        f.set('t1x', x1)
        f.set('t1z', z1)
        f.set('t1inputX', 0n)
        f.set('t1inputZ', 0n)

        if (f.get('t1wantFire') && !f.get('bActive')) {
          f.set('bActive', true)
          f.set('bx', x1)
          f.set('bz', z1)
          f.set('bdirX', f.get('t1dirX'))
          f.set('bdirZ', f.get('t1dirZ'))
          f.set('bBounces', 0n)
          f.set('bOwner', 1n)
          f.printString('Tank 1 fired!')
        }
        f.set('t1wantFire', false)

        const sh1 = f.get('t1shield')
        if (sh1 > 0n) f.set('t1shield', sh1 - 1n)
        const sp1 = f.get('t1speed')
        if (sp1 > 0n) f.set('t1speed', sp1 - 1n)
        const bn1 = f.get('t1bounce')
        if (bn1 > 0n) f.set('t1bounce', bn1 - 1n)

        if (f.get('pw1Active')) {
          const px = f.get('pw1X')
          const pz = f.get('pw1Z')
          const dx = x1 - px
          const dz = z1 - pz
          if (dx * dx + dz * dz < 4.0) {
            const pt = f.get('pw1Type')
            if (pt === 0n) { f.set('t1shield', 60n); f.printString('T1: Shield!') }
            if (pt === 1n) { f.set('t1bounce', 60n); f.printString('T1: Ricochet!') }
            if (pt === 2n) { f.set('t1speed', 60n); f.printString('T1: Speed!') }
            f.set('pw1Active', false)
          }
        }

        if (f.get('pw2Active')) {
          const px = f.get('pw2X')
          const pz = f.get('pw2Z')
          const dx = x1 - px
          const dz = z1 - pz
          if (dx * dx + dz * dz < 4.0) {
            const pt = f.get('pw2Type')
            if (pt === 0n) { f.set('t1shield', 60n); f.printString('T1: Shield!') }
            if (pt === 1n) { f.set('t1bounce', 60n); f.printString('T1: Ricochet!') }
            if (pt === 2n) { f.set('t1speed', 60n); f.printString('T1: Speed!') }
            f.set('pw2Active', false)
          }
        }
      }

      if (f.get('t2alive')) {
        let x2 = f.get('t2x')
        let z2 = f.get('t2z')
        const hasSpeed2 = f.get('t2speed') > 0n

        if (gameMode === 0n) {
          // AI
          const dirX = f.get('t2dirX')
          const dirZ = f.get('t2dirZ')
          let aiSpd = 0.3
          if (hasSpeed2) aiSpd = 0.5

          x2 = x2 + dirX * aiSpd
          z2 = z2 + dirZ * aiSpd

          if (x2 < -20.0) { x2 = -20.0; f.set('t2dirX', 1.0) }
          if (x2 > 20.0) { x2 = 20.0; f.set('t2dirX', -1.0) }
          if (z2 < -15.0) { z2 = -15.0; f.set('t2dirZ', 1.0) }
          if (z2 > 15.0) { z2 = 15.0; f.set('t2dirZ', -1.0) }

          f.set('t2x', x2)
          f.set('t2z', z2)

          if (newSeed % 30n === 0n) {
            const r = newSeed % 4n
            if (r === 0n) { f.set('t2dirX', 1.0); f.set('t2dirZ', 0.0) }
            if (r === 1n) { f.set('t2dirX', -1.0); f.set('t2dirZ', 0.0) }
            if (r === 2n) { f.set('t2dirX', 0.0); f.set('t2dirZ', 1.0) }
            if (r === 3n) { f.set('t2dirX', 0.0); f.set('t2dirZ', -1.0) }
          }

          if (!f.get('bActive') && newSeed % 20n === 0n) {
            f.set('bActive', true)
            f.set('bx', x2)
            f.set('bz', z2)
            f.set('bdirX', f.get('t2dirX'))
            f.set('bdirZ', f.get('t2dirZ'))
            f.set('bBounces', 0n)
            f.set('bOwner', 2n)
            f.printString('AI fired!')
          }
        } else {
          const inputX2 = f.get('t2inputX')
          const inputZ2 = f.get('t2inputZ')
          let moveSpd2 = 0.5
          if (hasSpeed2) moveSpd2 = 0.8

          if (inputX2 === -1n) { x2 = x2 - moveSpd2; f.set('t2dirX', -1.0); f.set('t2dirZ', 0.0) }
          if (inputX2 === 1n) { x2 = x2 + moveSpd2; f.set('t2dirX', 1.0); f.set('t2dirZ', 0.0) }
          if (inputZ2 === -1n) { z2 = z2 - moveSpd2; f.set('t2dirX', 0.0); f.set('t2dirZ', -1.0) }
          if (inputZ2 === 1n) { z2 = z2 + moveSpd2; f.set('t2dirX', 0.0); f.set('t2dirZ', 1.0) }

          if (x2 < -20.0) x2 = -20.0
          if (x2 > 20.0) x2 = 20.0
          if (z2 < -15.0) z2 = -15.0
          if (z2 > 15.0) z2 = 15.0

          f.set('t2x', x2)
          f.set('t2z', z2)
          f.set('t2inputX', 0n)
          f.set('t2inputZ', 0n)

          if (f.get('t2wantFire') && !f.get('bActive')) {
            f.set('bActive', true)
            f.set('bx', x2)
            f.set('bz', z2)
            f.set('bdirX', f.get('t2dirX'))
            f.set('bdirZ', f.get('t2dirZ'))
            f.set('bBounces', 0n)
            f.set('bOwner', 2n)
            f.printString('Tank 2 fired!')
          }
          f.set('t2wantFire', false)
        }

        const sh2 = f.get('t2shield')
        if (sh2 > 0n) f.set('t2shield', sh2 - 1n)
        const sp2 = f.get('t2speed')
        if (sp2 > 0n) f.set('t2speed', sp2 - 1n)
        const bn2 = f.get('t2bounce')
        if (bn2 > 0n) f.set('t2bounce', bn2 - 1n)

        const x2c = f.get('t2x')
        const z2c = f.get('t2z')

        if (f.get('pw1Active')) {
          const px = f.get('pw1X')
          const pz = f.get('pw1Z')
          const dx = x2c - px
          const dz = z2c - pz
          if (dx * dx + dz * dz < 4.0) {
            const pt = f.get('pw1Type')
            if (pt === 0n) { f.set('t2shield', 60n); f.printString('T2: Shield!') }
            if (pt === 1n) { f.set('t2bounce', 60n); f.printString('T2: Ricochet!') }
            if (pt === 2n) { f.set('t2speed', 60n); f.printString('T2: Speed!') }
            f.set('pw1Active', false)
          }
        }

        if (f.get('pw2Active')) {
          const px = f.get('pw2X')
          const pz = f.get('pw2Z')
          const dx = x2c - px
          const dz = z2c - pz
          if (dx * dx + dz * dz < 4.0) {
            const pt = f.get('pw2Type')
            if (pt === 0n) { f.set('t2shield', 60n); f.printString('T2: Shield!') }
            if (pt === 1n) { f.set('t2bounce', 60n); f.printString('T2: Ricochet!') }
            if (pt === 2n) { f.set('t2speed', 60n); f.printString('T2: Speed!') }
            f.set('pw2Active', false)
          }
        }
      }

      if (f.get('bActive')) {
        let bx = f.get('bx')
        let bz = f.get('bz')
        let bdx = f.get('bdirX')
        let bdz = f.get('bdirZ')
        let bounces = f.get('bBounces')

        bx = bx + bdx * 0.8
        bz = bz + bdz * 0.8

        if (bx < -20.0) { bx = -20.0; bdx = 1.0; bounces = bounces + 1n }
        if (bx > 20.0) { bx = 20.0; bdx = -1.0; bounces = bounces + 1n }
        if (bz < -15.0) { bz = -15.0; bdz = 1.0; bounces = bounces + 1n }
        if (bz > 15.0) { bz = 15.0; bdz = -1.0; bounces = bounces + 1n }

        if (bounces > 8n) {
          f.set('bActive', false)
        } else {
          f.set('bx', bx)
          f.set('bz', bz)
          f.set('bdirX', bdx)
          f.set('bdirZ', bdz)
          f.set('bBounces', bounces)

          const owner = f.get('bOwner')

          if (f.get('t2alive')) {
            const t2x = f.get('t2x')
            const t2z = f.get('t2z')
            const dx = bx - t2x
            const dz = bz - t2z
            if (dx * dx + dz * dz < 2.25) {
              if (f.get('t2shield') > 0n) {
                f.set('t2shield', 0n)
                f.set('bActive', false)
                f.printString('Shield blocked!')
              } else if (owner !== 2n || bounces > 0n) {
                f.set('t2alive', false)
                f.set('bActive', false)
                f.printString('Tank 2 destroyed!')
                send(SIGNAL_TANK_HIT)
              }
            }
          }

          if (f.get('t1alive')) {
            const t1x = f.get('t1x')
            const t1z = f.get('t1z')
            const dx1 = bx - t1x
            const dz1 = bz - t1z
            if (dx1 * dx1 + dz1 * dz1 < 2.25) {
              if (f.get('t1shield') > 0n) {
                f.set('t1shield', 0n)
                f.set('bActive', false)
                f.printString('Shield blocked!')
              } else if (owner !== 1n || bounces > 0n) {
                f.set('t1alive', false)
                f.set('bActive', false)
                f.printString('Tank 1 destroyed!')
                send(SIGNAL_TANK_HIT)
              }
            }
          }
        }
      }

      const timer = f.get('pwTimer') - 1n
      f.set('pwTimer', timer)

      if (timer <= 0n) {
        if (!f.get('pw1Active')) {
          const rx = (newSeed % 30n) - 15n
          const rz = ((newSeed / 30n) % 20n) - 10n
          const rt = newSeed % 3n
          f.set('pw1X', float(rx))
          f.set('pw1Z', float(rz))
          f.set('pw1Type', rt)
          f.set('pw1Active', true)
          if (rt === 0n) f.printString('Shield spawned!')
          if (rt === 1n) f.printString('Ricochet spawned!')
          if (rt === 2n) f.printString('Speed spawned!')
        } else if (!f.get('pw2Active')) {
          const rx2 = ((newSeed / 3n) % 30n) - 15n
          const rz2 = ((newSeed / 90n) % 20n) - 10n
          const rt2 = (newSeed / 3n) % 3n
          f.set('pw2X', float(rx2))
          f.set('pw2Z', float(rz2))
          f.set('pw2Type', rt2)
          f.set('pw2Active', true)
          if (rt2 === 0n) f.printString('Powerup 2 spawned!')
        }
        const interval = 30n + (newSeed % 30n)
        f.set('pwTimer', interval)
      }

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
    f.printString('Round End!')
    f.set('state', 3n)

    if (f.get('t1alive')) {
      f.set('scoreP1', f.get('scoreP1') + 1n)
      f.printString('Player 1 wins!')
    } else if (f.get('t2alive')) {
      f.set('scoreP2', f.get('scoreP2') + 1n)
      f.printString('Player 2 wins!')
    }

    setTimeout(() => {
      send(SIGNAL_ROUND_START)
    }, 2000)
  })
