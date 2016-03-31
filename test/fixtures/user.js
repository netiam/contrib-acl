export default {
  "data": {
    "id": "50c24ff3-4553-468a-89ae-ca5302ad5413",
    "type": "user",
    "attributes": {
      "email": "box@neti.am",
      "username": "hannes",
      "password": "test",
      "birthday": null,
      "createdAt": "2016-02-20T15:33:23.000Z",
      "updatedAt": "2016-02-20T15:33:23.000Z"
    },
    "relationships": {
      "campaigns": {
        "data": [
          {
            "id": "95601afb-8d60-482e-b98a-4ca3cada452d",
            "type": "campaign"
          }
        ]
      },
      "role": {
        "data": {
          "id": "f2b63b82-9c0e-40a5-9a0a-d6d3bd730202",
          "type": "role"
        }
      }
    }
  },
  "included": [
    {
      "id": "95601afb-8d60-482e-b98a-4ca3cada452d",
      "type": "campaign",
      "attributes": {
        "name": "city-rallye",
        "createdAt": "2016-02-20T15:33:23.000Z",
        "updatedAt": "2016-02-20T15:33:23.000Z"
      }
    }
  ]
}
