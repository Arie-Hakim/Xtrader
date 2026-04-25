import {
  Analyst,
  AnalystDNA,
  AnalystType,
  DbAnalystDnaRow,
  DbAnalystRow,
  fromDbEnum,
} from "../types";

export function toAnalystResponse(row: DbAnalystRow): Analyst {
  return {
    id: row.id,
    username: row.username,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    analyst_type: fromDbEnum(row.analyst_type) as AnalystType,
    analyst_weight: row.analyst_weight,
    tweets_learned_count: row.tweets_learned_count,
    created_at: row.created_at,
  };
}

export function toAnalystDnaResponse(row: DbAnalystDnaRow): AnalystDNA {
  return {
    id: row.id,
    analyst_id: row.analyst_id,
    version: row.version,
    profile_type: fromDbEnum(row.profile_type) as AnalystType,
    profile_data: row.profile_data,
    tweets_analyzed_count: row.tweets_analyzed_count,
    created_at: row.created_at,
  };
}
