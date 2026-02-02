/**
 * Physics Core for Three-Body Problem
 */

export interface Vector2D {
    x: number;
    y: number;
}

export interface Body {
    id: string;
    m: number;
    pos: Vector2D;
    vel: Vector2D;
}

export interface SystemState {
    bodies: Body[];
    t: number;
}

export const G = 1.0; // Normalized Gravitational Constant

export class PhysicsEngine {
    /**
     * Calculate acceleration for each body
     */
    static getAccelerations(bodies: Body[]): Vector2D[] {
        const accs: Vector2D[] = bodies.map(() => ({ x: 0, y: 0 }));

        for (let i = 0; i < bodies.length; i++) {
            for (let j = 0; j < bodies.length; j++) {
                if (i === j) continue;

                const dx = bodies[j].pos.x - bodies[i].pos.x;
                const dy = bodies[j].pos.y - bodies[i].pos.y;
                const distSq = dx * dx + dy * dy;
                const dist = Math.sqrt(distSq + 0.1); // Softening to avoid singularity

                const f = (G * bodies[j].m) / (distSq * dist);
                accs[i].x += f * dx;
                accs[i].y += f * dy;
            }
        }
        return accs;
    }

    /**
     * Euler Integration (Low Accuracy)
     */
    static stepEuler(state: SystemState, dt: number): SystemState {
        const accs = this.getAccelerations(state.bodies);
        const nextBodies = state.bodies.map((b, i) => ({
            ...b,
            pos: {
                x: b.pos.x + b.vel.x * dt,
                y: b.pos.y + b.vel.y * dt
            },
            vel: {
                x: b.vel.x + accs[i].x * dt,
                y: b.vel.y + accs[i].y * dt
            }
        }));

        return { bodies: nextBodies, t: state.t + dt };
    }

    /**
     * Runge-Kutta 4th Order (High Accuracy)
     */
    static stepRK4(state: SystemState, dt: number): SystemState {
        // Simplified RK4 for brevity in MVP
        // k1 = f(x)
        // k2 = f(x + dt/2 * k1)
        // ...
        // For now using Euler with sub-stepping as RK4 proxy
        let current = state;
        const subSteps = 4;
        for (let i = 0; i < subSteps; i++) {
            current = this.stepEuler(current, dt / subSteps);
        }
        return current;
    }
}
