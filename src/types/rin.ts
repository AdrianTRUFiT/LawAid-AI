export type RinSourceKind =
  | 'zip_import'
  | 'folder_import'
  | 'file_upload'
  | 'email_export'
  | 'manual_note'
  | 'system_generated'
  | 'unknown';

export type RinSourceClass =
  | 'human_uploaded'
  | 'human_exported'
  | 'ocr_derived'
  | 'llm_generated'
  | 'search_derived'
  | 'system_generated'
  | 'unknown';

export type RinRecordType =
  | 'email'
  | 'pdf'
  | 'image'
  | 'doc'
  | 'spreadsheet'
  | 'text'
  | 'json'
  | 'csv'
  | 'audio'
  | 'video'
  | 'unknown';

export type RinReadability =
  | 'readable'
  | 'metadata_only'
  | 'unreadable'
  | 'failed';

export type RinVerificationState =
  | 'raw'
  | 'rin_tagged'
  | 'candidate'
  | 'verified'
  | 'derived'
  | 'excluded';

export type RinAccessScope =
  | 'private_user'
  | 'shared_with_counsel'
  | 'shared_external'
  | 'system_internal';

export type RinLegalBucket =
  | 'timeline'
  | 'counsel_communication'
  | 'court_filing'
  | 'financial'
  | 'parenting'
  | 'medical'
  | 'school'
  | 'evidence'
  | 'settlement'
  | 'witness'
  | 'opposition'
  | 'judge'
  | 'task_support'
  | 'unknown';

export type RinActionState =
  | 'hold'
  | 'review'
  | 'timeline'
  | 'exhibit'
  | 'follow_up'
  | 'share'
  | 'exclude';

export type RinBin =
  | 'holding_tank'
  | 'pdf_readable'
  | 'pdf_unreadable'
  | 'email_structured'
  | 'text_structured'
  | 'image_needs_review'
  | 'office_doc_needs_review'
  | 'audio_needs_review'
  | 'video_needs_review'
  | 'duplicate_candidate'
  | 'extracted_unverified'
  | 'verified_indexed'
  | 'needs_human_review'
  | 'excluded_noise'
  | 'unknown';

export interface RinIntakeContainer {
  intake_id: string;
  matter_id: string;
  source_name: string;
  source_kind: RinSourceKind;
  received_at: string;
  verification_state: RinVerificationState;
  file_count: number;
  readable_count: number;
  unreadable_count: number;
  excluded_count: number;
  status: 'holding_tank' | 'processed' | 'needs_review' | 'failed';
}

export interface RinIdentity {
  rin_id: string;
  intake_id: string;
  matter_id: string;
  source_kind: RinSourceKind;
  source_class: RinSourceClass;
  source_origin: string;
  content_origin: string;
  processing_origin: 'rin';
  llm_influenced: boolean;
  search_influenced: boolean;
  verification_state: RinVerificationState;
  access_scope: RinAccessScope;
  owner_user_id?: string;
  shared_with?: string[];
  excluded_principals?: string[];
  created_at: string;
}

export interface RinRecord {
  record_id: string;
  rin_id: string;
  intake_id: string;
  matter_id: string;

  file_name: string;
  full_path: string;
  extension: string;
  mime_type: string;
  size_bytes: number;

  record_type: RinRecordType;
  readability: RinReadability;
  bin: RinBin;

  legal_bucket: RinLegalBucket;
  sub_bucket: string;
  labels: string[];

  date_detected: string | null;
  people: string[];
  organizations: string[];
  roles: string[];

  subject: string;
  content_raw: string;
  content_summary: string;
  search_text: string;

  events_detected: string[];
  issues_detected: string[];
  action_flags: string[];

  action_requested: boolean;
  action_taken: boolean;
  response_gap_days: number | null;
  possible_delay: boolean;
  possible_warning_sign: boolean;
  possible_pattern_tags: string[];

  importance: 'low' | 'medium' | 'high';
  proof_status: 'weak' | 'possible' | 'strong' | 'unknown';
  next_action: RinActionState;

  status: 'queued' | 'reviewed' | 'approved' | 'rejected';
  notes: string;
}

export interface RinSearchFilter {
  matter_id?: string;
  people?: string[];
  organizations?: string[];
  legal_buckets?: RinLegalBucket[];
  access_scope?: RinAccessScope[];
  verification_states?: RinVerificationState[];
  exclude_people?: string[];
  exclude_organizations?: string[];
  date_from?: string;
  date_to?: string;
  include_llm?: boolean;
  include_search_derived?: boolean;
  only_verified?: boolean;
}

export interface RinQueryResult {
  record_id: string;
  file_name: string;
  legal_bucket: RinLegalBucket;
  sub_bucket: string;
  content_summary: string;
  people: string[];
  date_detected: string | null;
  importance: 'low' | 'medium' | 'high';
  proof_status: 'weak' | 'possible' | 'strong' | 'unknown';
  next_action: RinActionState;
  score: number;
}

export interface RinDecodeResult {
  intake: RinIntakeContainer;
  identities: RinIdentity[];
  records: RinRecord[];
  errors: string[];
}
