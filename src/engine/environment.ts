/**
 * HRM Ecology: Environmental Dynamics Simulator
 * Generates dynamic perceptual observations and environmental perturbations
 */

import { PerceptualObservation, Vector2D } from '../types/hrm';

export type SimulationScenario = 'crypto_oracle' | 'defi_liquidity' | 'onchain_validator' | 'macro_arbitrage';

export interface EnvironmentEntity {
  id: string;
  type: 'hazard' | 'target' | 'obstacle';
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
}

export class EnvironmentSimulator {
  private scenario: SimulationScenario;
  private entities: EnvironmentEntity[] = [];
  private sensorLoss = false;
  private noiseLevel = 0.05;
  private stepCount = 0;

  constructor(scenario: SimulationScenario = 'crypto_oracle') {
    this.scenario = scenario;
    this.reset();
  }

  public reset(scenario?: SimulationScenario): void {
    if (scenario) this.scenario = scenario;
    this.stepCount = 0;
    this.sensorLoss = false;
    this.noiseLevel = 0.05;

    if (this.scenario === 'defi_liquidity') {
      this.entities = [
        {
          id: 'target_stablecoin_inflow',
          type: 'target',
          position: { x: 390, y: 310 },
          velocity: { x: -0.3, y: 0.15 },
          radius: 18,
        },
        {
          id: 'hazard_dex_liquidity_drain',
          type: 'hazard',
          position: { x: 210, y: 210 },
          velocity: { x: 0.5, y: -0.2 },
          radius: 25,
        },
        {
          id: 'obstacle_gas_congestion',
          type: 'obstacle',
          position: { x: 180, y: 280 },
          velocity: { x: 0, y: 0 },
          radius: 28,
        },
      ];
    } else if (this.scenario === 'onchain_validator') {
      this.entities = [
        {
          id: 'target_mempool_surge',
          type: 'target',
          position: { x: 370, y: 340 },
          velocity: { x: -0.4, y: 0.2 },
          radius: 16,
        },
        {
          id: 'hazard_orphan_block_risk',
          type: 'hazard',
          position: { x: 230, y: 190 },
          velocity: { x: 0.7, y: -0.35 },
          radius: 24,
        },
        {
          id: 'obstacle_hashrate_latency',
          type: 'obstacle',
          position: { x: 170, y: 300 },
          velocity: { x: 0, y: 0 },
          radius: 30,
        },
      ];
    } else if (this.scenario === 'macro_arbitrage') {
      this.entities = [
        {
          id: 'target_dxy_weakness_rally',
          type: 'target',
          position: { x: 400, y: 330 },
          velocity: { x: -0.25, y: 0.1 },
          radius: 18,
        },
        {
          id: 'hazard_rate_hike_shock',
          type: 'hazard',
          position: { x: 200, y: 220 },
          velocity: { x: 0.6, y: -0.3 },
          radius: 27,
        },
        {
          id: 'obstacle_fed_blackout_window',
          type: 'obstacle',
          position: { x: 190, y: 290 },
          velocity: { x: 0, y: 0 },
          radius: 28,
        },
      ];
    } else {
      // crypto_oracle (Default)
      this.entities = [
        {
          id: 'target_coinbase_liquidity',
          type: 'target',
          position: { x: 380, y: 320 },
          velocity: { x: -0.4, y: 0.1 },
          radius: 18,
        },
        {
          id: 'hazard_liquidation_cascade',
          type: 'hazard',
          position: { x: 220, y: 200 },
          velocity: { x: 0.6, y: -0.3 },
          radius: 26,
        },
        {
          id: 'obstacle_macro_tightening',
          type: 'obstacle',
          position: { x: 190, y: 290 },
          velocity: { x: 0, y: 0 },
          radius: 28,
        },
      ];
    }
  }

  public setSensorLoss(loss: boolean): void {
    this.sensorLoss = loss;
  }

  public setNoiseLevel(level: number): void {
    this.noiseLevel = Math.max(0, Math.min(1.0, level));
  }

  public step(nodePositions: Record<string, Vector2D>): PerceptualObservation {
    this.stepCount++;

    // Update entity positions (moving objects & dynamic obstacles)
    for (const ent of this.entities) {
      if (ent.type !== 'obstacle') {
        ent.position.x += ent.velocity.x;
        ent.position.y += ent.velocity.y;

        // Bounce off bounds
        if (ent.position.x < 50 || ent.position.x > 500) ent.velocity.x *= -1;
        if (ent.position.y < 50 || ent.position.y > 450) ent.velocity.y *= -1;
      }
    }

    // Generate observations for nodes based on proximity to target/hazard entities
    const sensedNodes: PerceptualObservation['sensedNodes'] = {};

    for (const nodeId in nodePositions) {
      const pos = nodePositions[nodeId];

      let nodeFieldValue = 0.3; // Default baseline

      for (const ent of this.entities) {
        const dist = Math.hypot(pos.x - ent.position.x, pos.y - ent.position.y);
        if (dist < 120) {
          const proximityFactor = (1.0 - dist / 120);
          if (ent.type === 'target') {
            nodeFieldValue += 0.5 * proximityFactor;
          } else if (ent.type === 'hazard') {
            nodeFieldValue -= 0.4 * proximityFactor;
          }
        }
      }

      // Add Gaussian sensor noise
      const noisyValue = Math.max(0, Math.min(1.0, nodeFieldValue + (Math.random() - 0.5) * this.noiseLevel));

      sensedNodes[nodeId] = {
        value: noisyValue,
        noise: this.noiseLevel,
      };
    }

    return {
      step: this.stepCount,
      sensedNodes,
      movingEntities: this.entities.map(e => ({
        id: e.id,
        position: { ...e.position },
        type: e.type,
      })),
      sensorLoss: this.sensorLoss,
      globalScarcityMultiplier: this.stepCount % 50 > 35 ? 0.6 : 1.0,
    };
  }

  public getEntities(): EnvironmentEntity[] {
    return this.entities;
  }
}
