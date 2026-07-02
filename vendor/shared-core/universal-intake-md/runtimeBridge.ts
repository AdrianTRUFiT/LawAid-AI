import fs from 'fs';
import { convertToMarkdownArtifact } from './mdConverter';
import { UniversalRawInput } from './intakeMdContracts';
import { intakeKnowledge } from '../knowledge-intake/index';

export function intakeToMarkdownAndKnowledge(input: UniversalRawInput) {
  const mdArtifact = convertToMarkdownArtifact(input);
  const mdBody = fs.readFileSync(mdArtifact.markdownPath, 'utf8');

  const knowledge = intakeKnowledge({
    sourceType:
      input.inputType === 'external_llm_output' ? 'external_llm_output' :
      input.inputType === 'session_extraction' ? 'session_extraction' :
      input.inputType === 'kb_update' ? 'kb_update' :
      input.inputType === 'code_handoff' ? 'code_handoff' :
      input.inputType === 'uploaded_file_text' ? 'uploaded_file' :
      'pasted_text',
    title: input.title,
    body: mdBody,
    submittedBy: input.submittedBy,
    sourceLabel: input.sourceLabel || mdArtifact.artifactId
  });

  return {
    mdArtifact,
    knowledge
  };
}
