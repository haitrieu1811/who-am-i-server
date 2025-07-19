import { ObjectId } from 'mongodb'

import Player from '~/models/databases/Player'
import { CreatePlayerReqBody } from '~/models/requests/players.requests'
import databaseService from '~/services/database.services'

class PlayersService {
  async insertOne(body: CreatePlayerReqBody) {
    const { insertedId } = await databaseService.players.insertOne(
      new Player({
        ...body,
        dateOfBirth: new Date(),
        nationId: new ObjectId(body.nationId),
        leagueId: new ObjectId(body.leagueId),
        teamId: new ObjectId(body.teamId),
        avatar: body.avatar ? new ObjectId(body.avatar) : undefined
      })
    )
    const player = await databaseService.players.findOne({
      _id: insertedId
    })
    return {
      player
    }
  }
}

const playersService = new PlayersService()
export default playersService
