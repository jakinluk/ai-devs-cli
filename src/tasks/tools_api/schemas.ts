// "Przypomnij mi, że mam kupić mleko = {\"tool\":\"ToDo\",\"desc\":\"Kup mleko\" }",
export const schemas = {
  todo: {
    name: 'todo',
    description: 'Add a new task to the todo list',
    parameters: {
      type: 'object',
      properties: {
        desc: {
          type: 'string',
        },
      },
    },
  },
  calendar: {
    name: 'calendar',
    description: 'Add a new event to the calendar',
    parameters: {
      type: 'object',
      properties: {
        desc: {
          type: 'string',
        },
        date: {
          type: 'string',
        },
      },
    },
  },
};
