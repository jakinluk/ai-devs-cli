/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
// simple rest client class backed by axios

import axios, { AxiosInstance } from 'axios';

export type Task = Record<string, unknown>;

export interface Answer {
  answer: string | number | boolean | Record<string, unknown> | Array<string | number | boolean>;
}

export interface Result {
  code: number;
  msg: string;
}

export interface TalonOneClientProviderConfig {
  baseUrl: string;
  apiKey: string;
}

export class TaskDevClientProvider {
  async provide(config: TalonOneClientProviderConfig): Promise<TaskDevClient> {
    return new TaskDevClient({
      apiUrl: config.baseUrl,
      apiKey: config.apiKey,
    });
  }
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TaskDevClientConfig {
  apiUrl: string;
  apiKey: string;
  debug?: boolean;
}

export interface TokenResponse {
  code: number;
  msg: string;
  token?: string;
}

export interface SubmitAnswerResponse {
  code: number;
  msg: string;
  [key: string]: unknown;
}

export class TaskDevClient {
  private client: AxiosInstance;

  private apiKey: string;

  constructor(private readonly config: TaskDevClientConfig) {
    this.client = axios.create({
      baseURL: `${config.apiUrl}/`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    });
    this.apiKey = config.apiKey;
    if (config.debug) {
      this.client.interceptors.request.use((request) => {
        console.log('Starting Request', JSON.stringify(request, null, 2));
        return request;
      });
    }
  }

  private getAuthorizationBody() {
    return {
      apikey: this.apiKey,
    };
  }

  async getToken(input: { taskName: string }): Promise<TokenResponse> {
    try {
      const resp = await this.client.post<TokenResponse>(`/token/${input.taskName}`, this.getAuthorizationBody());
      return resp.data;
    } catch (error) {
      this.printErrorDetails(error);
      throw error;
    }
  }

  private buildAnswer(answer: Answer) {
    return {
      answer: answer.answer,
    };
  }

  async submitAnswer(input: { answer: Answer; token: string }): Promise<SubmitAnswerResponse> {
    try {
      const resp = await this.client.post<SubmitAnswerResponse>(
        `/answer/${input.token}`,
        this.buildAnswer(input.answer)
      );
      return resp.data;
    } catch (error) {
      this.printErrorDetails(error);
      throw error;
    }
  }

  async getTask(input: { token: string }): Promise<Task> {
    try {
      const resp = await this.client.get<Task>(`/task/${input.token}`);
      return resp.data;
    } catch (error) {
      this.printErrorDetails(error);
      throw error;
    }
  }

  private printErrorDetails(error: any) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log('Error', error.message);
    }
    console.log(error.config);
  }
}
