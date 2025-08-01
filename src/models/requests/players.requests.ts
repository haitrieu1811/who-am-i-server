import { PlayerPosition } from '~/constants/enum'
import { PaginationReqQuery } from '~/models/requests/utils.requests'

export type CreatePlayerReqBody = {
  nationId: string
  leagueId: string
  teamId: string
  avatar: string | null
  name: string
  dateOfBirth: Date
  shirtNumber: number
  position: PlayerPosition
}

export type GetPlayersReqQuery = PaginationReqQuery & {
  name?: string
}

export type PlayerIdReqParams = {
  playerId: string
}
