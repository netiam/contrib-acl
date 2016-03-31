import userFixture from './user'
import projectFixture from './project'

export default Object.freeze({
  data: {
    type: 'user',
    attributes: userFixture.data.attributes,
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
})
