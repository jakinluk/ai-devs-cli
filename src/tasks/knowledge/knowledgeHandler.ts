/* eslint-disable no-underscore-dangle */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { BaseTaskHandler } from '../../core/handler/baseTaskHandler';
import { TaskDevClientProvider } from '../../core/clients/taskDevClient';
import * as config from '../config';
import { SolveKnowledgeCommand } from '../commands';
import { schemas } from './schemas';
import { parseFunctionCall } from '../../core/utils/parseFunctionCall';

const TASK_NAME = 'knowledge';

export class SolveKnowledgeCommandHandlerProvider {
  async provide(): Promise<SolveKnowledgeCommandHandler> {
    return new SolveKnowledgeCommandHandler(
      await new TaskDevClientProvider().provide({
        baseUrl: config.baseConfig.BASE_URL,
        apiKey: config.baseConfig.API_KEY,
      }),
      TASK_NAME
    );
  }
}

// {
//   "code": 0,
//   "msg": "I will ask you a question about the exchange rate, the current population or general knowledge. Decide whether you will take your knowledge from external sources or from the knowledge of the model",
//   "question": "ile orientacyjnie ludzi mieszka w Polsce?",
//   "database #1": "Currency http://api.nbp.pl/en.html (use table A)",
//   "database #2": "Knowledge about countries https://restcountries.com/ - field 'population'"
// }
type SolveKnowledgeTask = {
  question: string;
};

type SolveKnowledgeAnswer = {
  answer: string;
};

type FuncType = 'currency' | 'population' | 'general';

type CurrencyParams = {
  currency: string;
};

type PopulationParams = {
  country: string;
};

type GeneralParams = {
  question: string;
};

// [
//   {
//     "table": "A",
//     "no": "076/A/NBP/2024",
//     "effectiveDate": "2024-04-17",
//     "rates": [
//       {
//         "currency": "bat (Tajlandia)",
//         "code": "THB",
//         "mid": 0.1108
//       },
//       {
//         "currency": "dolar amerykański",
//         "code": "USD",
//         "mid": 4.0741
//       },
//     }
//   }
// ]
type CurrencyRates = {
  table: string;
  no: string;
  effectiveDate: string;
  rates: {
    currency: string;
    code: string;
    mid: number;
  }[];
};

// {
//   "name": {
//       "common": "Moldova",
//       "official": "Republic of Moldova",
//       "nativeName": {
//           "ron": {
//               "official": "Republica Moldova",
//               "common": "Moldova"
//           }
//       }
//   },
//   "population": 2617820
// }
type CountryPopulation = {
  name: {
    common: string;
    official: string;
    nativeName: {
      ron: {
        official: string;
        common: string;
      };
    };
  };
  population: number;
};

console.log(`Schemas:+ ${JSON.stringify([...Object.values(schemas)])}`);

const model = new ChatOpenAI({
  modelName: 'gpt-4-0613',
}).bind({ functions: [...Object.values(schemas)] });
// }).bind({ functions: [managerSchema], function_call: { name: 'task_manager' } });

export class SolveKnowledgeCommandHandler extends BaseTaskHandler<
  SolveKnowledgeCommand,
  SolveKnowledgeTask,
  SolveKnowledgeAnswer
> {
  private async getFunctionToCall(
    question: string
  ): Promise<{ funcToCall: FuncType; params: CurrencyParams | PopulationParams | GeneralParams }> {
    console.log(`User: ${question}`);
    const response = await model.invoke([
      // new SystemMessage(`Fact: Today is ${new Date().toLocaleDateString('en-US')}`),
      new HumanMessage(question),
    ]);
    const action = parseFunctionCall(response);
    if (!action) {
      return null;
    }
    return { funcToCall: action.name as FuncType, params: action.args };
  }

  async solve(command: SolveKnowledgeCommand, task: SolveKnowledgeTask): Promise<SolveKnowledgeAnswer> {
    // use function calling with json_mode to get the right function to call

    const { funcToCall, params } = await this.getFunctionToCall(task.question);

    console.log(`Function to call: ${funcToCall} + params: ${JSON.stringify(params)}`);

    let answer = '';
    switch (funcToCall) {
      case 'currency':
        answer = await this.getCurrency(params as CurrencyParams);
        break;
      case 'population':
        answer = await this.getPopulation(params as PopulationParams);
        break;
      case 'general':
        answer = await this.getGeneral(params as GeneralParams);
        break;
      default:
        break;
    }
    return { answer };
  }

  private async getGeneral(input: GeneralParams): Promise<string> {
    const { content } = await model.invoke([
      new SystemMessage(`Fact: Today is ${new Date().toLocaleDateString('en-US')}`),
      new HumanMessage(input.question),
    ]);
    return content as string;
  }

  private async getPopulation(input: PopulationParams): Promise<string> {
    // https://restcountries.com/v3.1/all?fields=name,population
    const countryPopulations = await fetch('https://restcountries.com/v3.1/all?fields=name,population');
    const countries = (await countryPopulations.json()) as CountryPopulation[];
    return countries.find((country) => country.name.common === input.country)?.population.toString();
  }

  private async getCurrency(input: { currency: string }): Promise<string> {
    // https://api.nbp.pl/api/exchangerates/rates/A/eur/last/?format=json
    // https://api.nbp.pl/api/exchangerates/tables/A/2024-04-17/2024-04-17?format=json
    const response = await fetch(`http://api.nbp.pl/api/exchangerates/rates/A/${input.currency}/last/?format=json`);
    const currencyRates = (await response.json()) as CurrencyRates;
    return currencyRates.rates.find((rate) => rate.code === input.currency)?.mid.toString();
  }
}
