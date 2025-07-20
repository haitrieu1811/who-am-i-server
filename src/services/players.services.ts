import omitBy from 'lodash/omitBy'
import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import Player from '~/models/databases/Player'
import { CreatePlayerReqBody, GetPlayersReqQuery } from '~/models/requests/players.requests'
import databaseService from '~/services/database.services'
import { configurePagination } from '~/utils/helpers'

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

  async aggregatePlayers({ match = {}, skip = 0, limit = 20 }: { match?: object; skip?: number; limit?: number }) {
    const [players, totalPlayers] = await Promise.all([
      databaseService.players
        .aggregate([
          {
            $match: match
          },
          {
            $lookup: {
              from: 'images',
              localField: 'avatar',
              foreignField: '_id',
              as: 'avatar'
            }
          },
          {
            $unwind: {
              path: '$avatar',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'nations',
              localField: 'nationId',
              foreignField: '_id',
              as: 'nation'
            }
          },
          {
            $unwind: {
              path: '$nation'
            }
          },
          {
            $lookup: {
              from: 'leagues',
              localField: 'leagueId',
              foreignField: '_id',
              as: 'league'
            }
          },
          {
            $unwind: {
              path: '$league'
            }
          },
          {
            $lookup: {
              from: 'teams',
              localField: 'teamId',
              foreignField: '_id',
              as: 'team'
            }
          },
          {
            $unwind: {
              path: '$team',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'images',
              localField: 'nation.flag',
              foreignField: '_id',
              as: 'nationFlag'
            }
          },
          {
            $unwind: {
              path: '$nationFlag'
            }
          },
          {
            $lookup: {
              from: 'images',
              localField: 'league.logo',
              foreignField: '_id',
              as: 'leagueLogo'
            }
          },
          {
            $unwind: {
              path: '$leagueLogo'
            }
          },
          {
            $lookup: {
              from: 'images',
              localField: 'team.logo',
              foreignField: '_id',
              as: 'teamLogo'
            }
          },
          {
            $unwind: {
              path: '$teamLogo'
            }
          },
          {
            $addFields: {
              avatar: {
                $cond: [
                  '$avatar',
                  {
                    $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$avatar.name']
                  },
                  null
                ]
              },
              'nation.flag': {
                $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$nationFlag.name']
              },
              'league.logo': {
                $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$leagueLogo.name']
              },
              'team.logo': {
                $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$teamLogo.name']
              }
            }
          },
          {
            $group: {
              _id: '$_id',
              name: {
                $first: '$name'
              },
              avatar: {
                $first: '$avatar'
              },
              shirtNumber: {
                $first: '$shirtNumber'
              },
              position: {
                $first: '$position'
              },
              nation: {
                $first: '$nation'
              },
              league: {
                $first: '$league'
              },
              team: {
                $first: '$team'
              },
              dateOfBirth: {
                $first: '$dateOfBirth'
              },
              createdAt: {
                $first: '$createdAt'
              },
              updatedAt: {
                $first: '$updatedAt'
              }
            }
          },
          {
            $sort: {
              name: 1
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      databaseService.players
        .aggregate([
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])
    return {
      players,
      totalPlayers: totalPlayers[0].total
    }
  }

  async findMany(query: GetPlayersReqQuery) {
    const { page, limit, skip } = configurePagination(query)
    const text = query.name
      ? {
          $text: {
            $search: query.name
          }
        }
      : {}
    const match = omitBy({
      ...text
    })
    const { players, totalPlayers } = await this.aggregatePlayers({
      match,
      skip,
      limit
    })
    return {
      players,
      page,
      limit,
      totalRows: totalPlayers,
      totalPages: Math.ceil(totalPlayers / limit)
    }
  }

  async findOne(playerId: ObjectId) {
    const { players } = await this.aggregatePlayers({
      match: {
        _id: playerId
      }
    })
    return {
      player: players[0]
    }
  }

  async updateOne({ body, playerId }: { body: CreatePlayerReqBody; playerId: ObjectId }) {
    await databaseService.players.updateOne(
      {
        _id: playerId
      },
      {
        $set: {
          ...body,
          dateOfBirth: new Date(),
          nationId: new ObjectId(body.nationId),
          leagueId: new ObjectId(body.leagueId),
          teamId: new ObjectId(body.teamId),
          avatar: body.avatar ? new ObjectId(body.avatar) : null
        },
        $currentDate: {
          updatedAt: true
        }
      }
    )
    const { players } = await this.aggregatePlayers({
      match: {
        _id: playerId
      }
    })
    return {
      player: players[0]
    }
  }

  async deleteOne(playerId: ObjectId) {
    await databaseService.players.deleteOne({
      _id: playerId
    })
    return true
  }
}

const playersService = new PlayersService()
export default playersService
