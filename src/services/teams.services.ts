import { ObjectId } from 'mongodb'
import omitBy from 'lodash/omitBy'
import isUndefined from 'lodash/isUndefined'

import { ENV_CONFIG } from '~/constants/config'
import Team from '~/models/databases/Team'
import { CreateTeamReqBody, GetTeamsReqQuery } from '~/models/requests/teams.requests'
import databaseService from '~/services/database.services'
import { configurePagination } from '~/utils/helpers'

class TeamsService {
  async insertOne(body: CreateTeamReqBody) {
    const { insertedId } = await databaseService.teams.insertOne(
      new Team({
        ...body,
        logo: new ObjectId(body.logo),
        leagueId: new ObjectId(body.leagueId)
      })
    )
    const team = await databaseService.teams.findOne({
      _id: insertedId
    })
    return {
      team
    }
  }

  async aggregateTeam({ match = {}, skip = 0, limit = 20 }: { match?: object; skip?: number; limit?: number }) {
    const [teams, totalTeams] = await Promise.all([
      databaseService.teams
        .aggregate([
          {
            $match: match
          },
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
      databaseService.teams
        .aggregate([
          {
            $match: match
          },
          {
            $count: 'count'
          }
        ])
        .toArray()
    ])
    return {
      teams,
      totalTeams: totalTeams[0]?.count ?? 0
    }
  }

  async findMany(query: GetTeamsReqQuery) {
    const { page, limit, skip } = configurePagination(query)
    const text = query.name
      ? {
          $text: {
            $search: query.name
          }
        }
      : {}
    const match = omitBy(
      {
        ...text,
        leagueId: query.leagueId ? new ObjectId(query.leagueId) : undefined
      },
      isUndefined
    )
    const { teams, totalTeams } = await this.aggregateTeam({ limit, skip, match })
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
          logo: new ObjectId(body.logo),
          leagueId: new ObjectId(body.leagueId)
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
