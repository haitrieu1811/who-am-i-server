import { PaginationReqQuery } from '~/models/requests/utils.requests'

export type CreateTeamReqBody = {
  logo: string
  name: string
  leagueId: string
}

export type TeamIdReqParams = {
  teamId: string
}

export type GetTeamsReqQuery = PaginationReqQuery & {
  name?: string
  leagueId?: string
}
