import { describe, it, expect } from 'vitest';
import { evaluateCheckResult } from './evaluate.js';

describe('evaluateCheckResult', () => {
  describe('when check succeeds', () => {
    it('returns up status with 0 consecutive failures', () => {
      const result = evaluateCheckResult(true, 'up', 0);
      expect(result.status).toBe('up');
      expect(result.consecutiveFailures).toBe(0);
      expect(result.becameDown).toBe(false);
      expect(result.becameUp).toBe(false);
    });

    it('sets becameUp=true when recovering from down', () => {
      const result = evaluateCheckResult(true, 'down', 3);
      expect(result.status).toBe('up');
      expect(result.becameUp).toBe(true);
      expect(result.becameDown).toBe(false);
      expect(result.consecutiveFailures).toBe(0);
    });
  });

  describe('when check fails', () => {
    it('increments consecutiveFailures but does NOT change status on first failure', () => {
      const result = evaluateCheckResult(false, 'up', 0);
      expect(result.status).toBe('up');
      expect(result.consecutiveFailures).toBe(1);
      expect(result.becameDown).toBe(false);
    });

    it('transitions to down on second consecutive failure', () => {
      const result = evaluateCheckResult(false, 'up', 1);
      expect(result.status).toBe('down');
      expect(result.consecutiveFailures).toBe(2);
      expect(result.becameDown).toBe(true);
    });

    it('does NOT set becameDown again when already down', () => {
      const result = evaluateCheckResult(false, 'down', 5);
      expect(result.status).toBe('down');
      expect(result.consecutiveFailures).toBe(6);
      expect(result.becameDown).toBe(false);
    });
  });

  describe('transient failure recovery', () => {
    it('recovers to up with no state change after single failure', () => {
      // up → failure → success → up (no state change, no alert)
      const result = evaluateCheckResult(true, 'up', 1);
      expect(result.status).toBe('up');
      expect(result.consecutiveFailures).toBe(0);
      expect(result.becameDown).toBe(false);
      expect(result.becameUp).toBe(false);
    });
  });
});
