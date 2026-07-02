import { IntakeMark, UniversalRawInput } from './intakeMdContracts';
import { makeId } from './intakeMdUtils';

export function assignIntakeMark(input: UniversalRawInput): IntakeMark {
  return {
    intakeMarkId: makeId('INTAKE', input),
    traceable: true,
    authoritative: false,
    verificationStatus: 'UNVERIFIED',
    soulmarkStatus: 'NOT_SEALED'
  };
}
