import { PlayerPosition } from '~/constants/enum'

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
