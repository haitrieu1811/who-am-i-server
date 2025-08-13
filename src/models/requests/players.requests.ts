import { PlayerPosition } from '~/constants/enum'
import { PaginationReqQuery } from '~/models/requests/utils.requests'

export type CreatePlayerReqBody = {
  nationId: string
  leagueId: string
  teamId: string
  avatar: string | null
  name: string
  dateOfBirth: string
  shirtNumber: number
  position: PlayerPosition
}

export type GetPlayersReqQuery = PaginationReqQuery & {
  name?: string
  nationId?: string
  leagueId?: string
  teamId?: string
  position?: string
}

export type PlayerIdReqParams = {
  playerId: string
}
