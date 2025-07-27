import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import Team from '~/models/databases/Team'
import { CreateTeamReqBody } from '~/models/requests/teams.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import databaseService from '~/services/database.services'
import { configurePagination } from '~/utils/helpers'

class TeamsService {
  async insertOne({ body, leagueId }: { body: CreateTeamReqBody; leagueId: ObjectId }) {
    const { insertedId } = await databaseService.teams.insertOne(
      new Team({
        ...body,
        logo: new ObjectId(body.logo),
        leagueId
      })
    )
    const team = await databaseService.teams.findOne({
      _id: insertedId
    })
    return {
      team
    }
  }

  async findMany(query: PaginationReqQuery) {
    const { page, limit, skip } = configurePagination(query)
    const [teams, totalTeams] = await Promise.all([
      databaseService.teams
        .aggregate([
          {
            $lookup: {
              from: 'images',
              localField: 'logo',
              foreignField: '_id',
              as: 'logo'
            }
          },
          {
            $unwind: {
              path: '$logo'
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
            $addFields: {
              logo: {
                url: {
                  $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$logo.name']
                }
              },
              'league.logo': {
                $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$leagueLogo.name']
              }
            }
          },
          {
            $group: {
              _id: '$_id',
              logo: {
                $first: '$logo'
              },
              name: {
                $first: '$name'
              },
              league: {
                $first: '$league'
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
            $project: {
              'logo.name': 0,
              'logo.createdAt': 0,
              'logo.updatedAt': 0
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
      databaseService.teams.countDocuments({})
    ])
    return {
      teams,
      page,
      limit,
      totalRows: totalTeams,
      totalPages: Math.ceil(totalTeams / limit)
    }
  }

  async updateOne({ body, teamId }: { body: CreateTeamReqBody; teamId: ObjectId }) {
    const team = await databaseService.teams.findOneAndUpdate(
      {
        _id: teamId
      },
      {
        $set: {
          ...body,
          logo: new ObjectId(body.logo)
        },
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return {
      team
    }
  }

  async deleteOne(teamId: ObjectId) {
    await databaseService.teams.deleteOne({
      _id: teamId
    })
    return true
  }
}

const teamsService = new TeamsService()
export default teamsService
