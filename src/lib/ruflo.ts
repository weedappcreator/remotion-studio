/**
 * Ruflo Integration — Remotion Studio
 *
 * Agent orchestration patterns for coordinated video generation pipelines.
 * Mirrors the ruflo.ts patterns used in premium-website-generator.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type RufloAgentType = 'researcher' | 'coder' | 'reviewer' | 'designer';

export interface RufloAgent {
  type: RufloAgentType;
  name: string;
  role: string;
}

export interface SwarmConfig {
  maxAgents: number;
  strategy: 'parallel' | 'sequential' | 'hybrid';
  timeout: number; // ms
}

export interface VideoSwarmResult {
  swarmConfig: SwarmConfig;
  agents: RufloAgent[];
  memoryNamespace: string;
  task: string;
}

export interface VoiceSwarmResult {
  swarmConfig: SwarmConfig;
  agents: RufloAgent[];
  memoryNamespace: string;
  script: string;
}

// ─── Memory Namespaces ───────────────────────────────────────────────────────

export const MEMORY_NAMESPACES = {
  compositions: 'remotion:compositions',
  voiceovers: 'remotion:voiceovers',
  sessions: 'remotion:sessions',
  exports: 'remotion:exports',
} as const;

// ─── Default Swarm Config ────────────────────────────────────────────────────

export const DEFAULT_SWARM_CONFIG: SwarmConfig = {
  maxAgents: 3,
  strategy: 'hybrid',
  timeout: 60_000,
};

// ─── Video Generation Agents ─────────────────────────────────────────────────

export const VIDEO_AGENTS: RufloAgent[] = [
  {
    type: 'researcher',
    name: 'composition-analyst',
    role: 'Analyze composition requirements and determine optimal timing and structure',
  },
  {
    type: 'coder',
    name: 'animation-builder',
    role: 'Build Remotion animation sequences with GSAP and spring physics',
  },
  {
    type: 'coder',
    name: 'voiceover-sync',
    role: 'Sync audio timestamps to visual keyframes in the composition',
  },
  {
    type: 'reviewer',
    name: 'timing-reviewer',
    role: 'Review overall timing, transitions, and audio-visual sync quality',
  },
];

// ─── OpenLess Voice Input Agents ─────────────────────────────────────────────

export const OPENLESS_AGENTS: RufloAgent[] = [
  {
    type: 'researcher',
    name: 'voice-researcher',
    role: 'Detect and validate incoming voice scripts from clipboard',
  },
  {
    type: 'coder',
    name: 'script-formatter',
    role: 'Format raw voice transcript into clean video narration',
  },
  {
    type: 'coder',
    name: 'tts-generator',
    role: 'Generate Resemble AI voiceover from polished script',
  },
  {
    type: 'reviewer',
    name: 'timing-validator',
    role: 'Validate audio duration matches composition timing',
  },
];

// ─── Swarm Builders ──────────────────────────────────────────────────────────

/**
 * Build a swarm config for general video generation tasks.
 */
export function buildVideoSwarmConfig(task: string): VideoSwarmResult {
  return {
    swarmConfig: { ...DEFAULT_SWARM_CONFIG, maxAgents: VIDEO_AGENTS.length },
    agents: VIDEO_AGENTS,
    memoryNamespace: MEMORY_NAMESPACES.compositions,
    task,
  };
}

/**
 * Build a swarm config for voice-to-video clipboard watcher tasks.
 */
export function buildVoiceInputSwarmConfig(script: string): VoiceSwarmResult {
  return {
    swarmConfig: { ...DEFAULT_SWARM_CONFIG, maxAgents: 4 },
    agents: OPENLESS_AGENTS,
    memoryNamespace: MEMORY_NAMESPACES.sessions,
    script,
  };
}

// ─── Utility ─────────────────────────────────────────────────────────────────

/**
 * Log agent spawn info to the console (lightweight mock of Ruflo MCP swarm_init).
 */
export function logSwarmInit(agents: RufloAgent[], task: string): void {
  console.log(`[Ruflo] Initializing swarm for: ${task}`);
  for (const agent of agents) {
    console.log(`[Ruflo]   ↳ [${agent.type}] ${agent.name} — ${agent.role}`);
  }
}
