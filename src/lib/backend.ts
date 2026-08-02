// Backend namespace. Trace runs on its own dedicated Supabase project;
// table and function names are unprefixed there. Realtime topics keep the
// `trace:` prefix — the private-channel RLS policies authorize
// `trace:couple:{couple_id}` for couple members only.
export const TABLES = {
  couples: 'couples',
  members: 'members',
  canvases: 'canvases',
  strokes: 'strokes',
  dailyMarks: 'daily_marks',
  pushTokens: 'push_tokens',
  widgetTokens: 'widget_tokens',
} as const;

export const RPCS = {
  createCouple: 'create_couple',
  joinCouple: 'join_couple',
  setDisplayName: 'set_display_name',
  leaveCouple: 'leave_couple',
  myStatus: 'my_status',
} as const;

export const EDGE_FUNCTIONS = {
  notifyPartner: 'notify-partner',
  buzzPartner: 'buzz-partner',
  signup: 'trace-signup',
  renderSnapshot: 'render-snapshot',
  widgetSnapshot: 'widget-snapshot',
  deleteAccount: 'delete-account',
} as const;

export const coupleChannel = (coupleId: string) => `trace:couple:${coupleId}`;
