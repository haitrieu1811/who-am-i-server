import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import Question from '~/models/databases/Question'
import { CreateQuestionReqBody } from '~/models/requests/questions.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import databaseService from '~/services/database.services'
import { configurePagination } from '~/utils/helpers'

class QuestionsService {
  async insertOne(body: CreateQuestionReqBody) {
    const { insertedId } = await databaseService.questions.insertOne(
      new Question({
        ...body,
        answerId: new ObjectId(body.answerId)
      })
    )
    const question = await databaseService.questions.findOne({
      _id: insertedId
    })
    return {
      question
    }
  }

  async updateOne({ body, questionId }: { body: CreateQuestionReqBody; questionId: ObjectId }) {
    const question = await databaseService.questions.findOneAndUpdate(
      {
        _id: questionId
      },
      {
        $set: {
          ...body,
          answerId: new ObjectId(body.answerId)
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
      question
    }
  }

  aggregateQuestion() {
    return [
      {
        $lookup: {
          from: 'players',
          localField: 'answerId',
          foreignField: '_id',
          as: 'player'
        }
      },
      {
        $unwind: {
          path: '$player'
        }
      },
      {
        $lookup: {
          from: 'images',
          localField: 'player.avatar',
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
          localField: 'player.nationId',
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
          localField: 'player.leagueId',
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
          localField: 'player.teamId',
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
          'player.avatar': {
            _id: '$avatar._id',
            url: {
              $cond: [
                '$avatar',
                {
                  $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$avatar.name']
                },
                null
              ]
            }
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
        $addFields: {
          'player.age': {
            $dateDiff: {
              startDate: '$player.dateOfBirth',
              endDate: '$$NOW',
              unit: 'year'
            }
          },
          'player.nation': '$nation',
          'player.league': '$league',
          'player.team': '$team'
        }
      },
      {
        $group: {
          _id: '$_id',
          player: {
            $first: '$player'
          },
          level: {
            $first: '$level'
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
          'player.nationId': 0,
          'player.leagueId': 0,
          'player.teamId': 0,
          'player.createdAt': 0,
          'player.updatedAt': 0,
          'player.team.leagueId': 0
        }
      }
    ]
  }

  async findOne(match: object = {}) {
    const aggregate = this.aggregateQuestion()
    const questions = await databaseService.questions
      .aggregate([
        {
          $match: match
        },
        ...aggregate,
        {
          $sample: {
            size: 1
          }
        }
      ])
      .toArray()
    return {
      question: questions[0]
    }
  }

  async findMany(query: PaginationReqQuery) {
    const { page, limit, skip } = configurePagination(query)
    const aggregate = this.aggregateQuestion()
    const [questions, totalQuestions] = await Promise.all([
      databaseService.questions
        .aggregate([
          ...aggregate,
          {
            $skip: skip
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      databaseService.questions.countDocuments({})
    ])
    return {
      questions,
      page,
      limit,
      totalRows: totalQuestions,
      totalPages: Math.ceil(totalQuestions / limit)
    }
  }

  async deleteOne(questionId: ObjectId) {
    await databaseService.questions.deleteOne({
      _id: questionId
    })
    return true
  }
}

const questionsService = new QuestionsService()
export default questionsService
