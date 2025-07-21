import { ObjectId } from 'mongodb'

import Question from '~/models/databases/Question'
import { QuestionLevel } from '~/constants/enum'
import { CreateQuestionReqBody } from '~/models/requests/questions.requests'
import databaseService from '~/services/database.services'

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

  async findOne(level: QuestionLevel) {
    const questions = await databaseService.questions
      .aggregate([
        {
          $match: {
            level
          }
        },
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
              $cond: [
                '$avatar',
                {
                  $concat: ['', '/', '$avatar.name']
                },
                null
              ]
            },
            'nation.flag': {
              $concat: ['', '/', '$nationFlag.name']
            },
            'league.logo': {
              $concat: ['', '/', '$leagueLogo.name']
            },
            'team.logo': {
              $concat: ['', '/', '$teamLogo.name']
            }
          }
        },
        {
          $addFields: {
            'player.nation': '$nation',
            'player.league': '$league',
            'player.team': '$team',
            'player.age': {
              $dateDiff: {
                startDate: '$player.dateOfBirth',
                endDate: '$$NOW',
                unit: 'year'
              }
            }
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
            'player.dateOfBirth': 0,
            'player.createdAt': 0,
            'player.updatedAt': 0,
            'player.team.leagueId': 0
          }
        },
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
}

const questionsService = new QuestionsService()
export default questionsService
