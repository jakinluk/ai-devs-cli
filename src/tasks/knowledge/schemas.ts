export const schemas = {
  general: {
    name: 'general',
    description: 'General knowledge',
    parameters: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
        },
      },
    },
  },
  currency: {
    name: 'currency',
    description: 'Get currency exchange rate',
    parameters: {
      type: 'object',
      properties: {
        currency: {
          type: 'string',
          description: 'Currency code',
        },
      },
    },
  },
  population: {
    name: 'population',
    description: 'Get population of a country',
    parameters: {
      type: 'object',
      properties: {
        country: {
          type: 'string',
          description: 'English name of a country',
        },
      },
    },
  },
};
