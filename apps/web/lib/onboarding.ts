import { monitorRepository } from './repositories/monitors';
import { teamRepository } from './repositories/teams';

// A team is onboarded once it has a monitor, or has explicitly finished/skipped
// the wizard (onboardingCompletedAt). Both /onboarding and /today must use this
// exact check so their redirects can never disagree with each other.
export async function isTeamOnboarded(teamId: string): Promise<boolean> {
  const [monitorCount, onboardingCompletedAt] = await Promise.all([
    monitorRepository.countByTeam(teamId),
    teamRepository.findOnboardingCompletedAt(teamId),
  ]);
  return monitorCount > 0 || onboardingCompletedAt !== null;
}
