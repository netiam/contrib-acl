import projectFixture from './project'
import userFixture from './user'

export default Object.freeze({
  data: [
    {
      type: 'user',
      attributes: {
        username: 'user1',
        email: 'test1@neti.am',
        birthday: new Date(2015, 7, 3)
      },
      relationships: {
        projects: {
          data: [
            {
              type: 'project',
              id: projectFixture.id
            }
          ]
        }
      }
    },
    {
      type: 'user',
      attributes: {
        username: 'user2',
        email: 'test2@neti.am',
        birthday: new Date(2015, 7, 3)
      },
      relationships: {
        projects: {
          data: [
            {
              type: 'project',
              id: projectFixture.id
            }
          ]
        }
      }
    }
  ]
})
