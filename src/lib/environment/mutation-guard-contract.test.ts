import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const guardedFunctions: Record<string, string[]> = {
  "src/lib/services/auth.service.ts": ["signUpTrainer"],
  "src/lib/services/invitation.service.ts": [
    "createInvitation",
    "revokeInvitation",
    "deleteInvitation",
    "completeInvitationAcceptance",
    "acceptInvitation",
  ],
  "src/lib/services/athlete.service.ts": ["updateTrainerAthleteOperationalProfile"],
  "src/lib/services/training.service.ts": [
    "createTraining",
    "deleteTrainerTraining",
    "assignTrainingToAthletes",
  ],
  "src/lib/services/training-execution.service.ts": ["startTraining", "completeTraining"],
  "src/lib/services/athlete-equipment.service.ts": [
    "createAthleteEquipment",
    "deactivateAthleteEquipment",
    "linkAthleteEquipmentExecution",
  ],
  "src/lib/services/performance-assessment.service.ts": ["createTrainerAthletePerformanceAssessment"],
  "src/lib/services/schedule.service.ts": ["scheduleTraining"],
  "src/lib/services/financial.service.ts": [
    "createSubscription",
    "markChargePaid",
    "updateSubscriptionStatus",
  ],
  "src/lib/services/communication.service.ts": [
    "saveCommunicationPreference",
    "queueBillingReminder",
  ],
};

describe("preview read-only mutation contract", () => {
  for (const [path, functionNames] of Object.entries(guardedFunctions)) {
    for (const [index, functionName] of functionNames.entries()) {
      it(`${functionName} checks the environment before creating a Supabase client`, () => {
        const source = readFileSync(resolve(path), "utf8");
        const start = source.indexOf(`function ${functionName}`);
        const nextName = functionNames[index + 1];
        const end = nextName ? source.indexOf(`function ${nextName}`, start) : source.length;
        const body = source.slice(start, end);
        const guard = body.indexOf("assertApplicationMutationAllowed()");
        const client = body.indexOf("createServerClient()");

        expect(start, `${path} deve exportar ${functionName}`).toBeGreaterThanOrEqual(0);
        expect(guard, `${functionName} deve ter guard`).toBeGreaterThanOrEqual(0);
        expect(client, `${functionName} deve criar o client após o guard`).toBeGreaterThanOrEqual(0);
        expect(guard, `${functionName} deve bloquear antes do client`).toBeLessThan(client);
      });
    }
  }
});
