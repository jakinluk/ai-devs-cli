/* eslint-disable no-underscore-dangle */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { Document } from 'langchain/document';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { v4 as uuidv4 } from 'uuid';
import { QdrantClient } from '@qdrant/js-client-rest';
import fs from 'fs';
import path, { dirname } from 'path';
import stringHash from 'string-hash';
import { fileURLToPath } from 'url';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { BaseTaskHandler } from '../../core/handler/baseTaskHandler';
import { TaskDevClientProvider } from '../../core/clients/taskDevClient';
import * as config from '../config';
import { SolvePeopleCommand } from '../commands';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TASK_NAME = 'people';

const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });
const embeddings = new OpenAIEmbeddings({ maxConcurrency: 5 });

export class SolvePeopleCommandHandlerProvider {
  async provide(): Promise<SolvePeopleCommandHandler> {
    return new SolvePeopleCommandHandler(
      await new TaskDevClientProvider().provide({
        baseUrl: config.baseConfig.BASE_URL,
        apiKey: config.baseConfig.API_KEY,
      }),
      TASK_NAME
    );
  }
}

type SolvePeopleTask = {
  data: string;
  question: string;
};

type SolvePeopleAnswer = {
  answer: string;
};

// {
//   "imie": "Dariusz",
//   "nazwisko": "Kaczor",
//   "wiek": 46,
//   "o_mnie": "niekiedy lubie je\u015b\u0107 lody. Mieszkam w Radomiu. Interesuj\u0119 mnie polikyka a tak\u017ce \u017ceglarstwo",
//   "ulubiona_postac_z_kapitana_bomby": "Admira\u0142 Gwiezdnej Floty",
//   "ulubiony_serial": "Stranger Things",
//   "ulubiony_film": "Avengers",
//   "ulubiony_kolor": "morski"
// }

type People = {
  imie: string;
  nazwisko: string;
  wiek: number;
  o_mnie: string;
  ulubiona_postac_z_kapitana_bomby: string;
  ulubiony_serial: string;
  ulubiony_film: string;
  ulubiony_kolor: string;
};

type EmbeddingCache = {
  [key: string]: number[];
};

const COLLECTION_NAME = 'people_v1';

const systemTemplate = `
Odpowiedź na pytanie o ulubiony kolor, ulubione jedzenie i miejsce zamieszkania znajdziesz w danych uytkowników poniżej.

Użytkownicy:
###
{context}
###

Pytanie:
`;

const humanTemplate = `
{question} 
`;

export class SolvePeopleCommandHandler extends BaseTaskHandler<SolvePeopleCommand, SolvePeopleTask, SolvePeopleAnswer> {
  private async initQdrant(): Promise<QdrantClient> {
    const result = await qdrant.getCollections();
    const indexed = result.collections.find((collection) => collection.name === COLLECTION_NAME);
    console.log(result);
    if (!indexed) {
      await qdrant.createCollection(COLLECTION_NAME, { vectors: { size: 1536, distance: 'Cosine', on_disk: true } });
    }

    return qdrant;
  }

  private buildPageContent(info: People): string {
    const name = `${info.imie} ${info.nazwisko}`;
    const aboutMe = Object.entries(info).reduce((acc, [key, value]) => {
      switch (key) {
        case 'imie':
          return acc;
        case 'nazwisko':
          return acc;
        case 'wiek':
          return `${acc} ${name} ma ${value} lat.`;
        case 'o_mnie':
          return `${acc} ${value}.`;
        case 'ulubiona_postac_z_kapitana_bomby':
          return `${acc} ${name} ulubioną postacią z Kapitana Bomby jest ${value}.`;
        case 'ulubiony_serial':
          return `${acc} Ulubionym serialem ${name} jest ${value}.`;
        case 'ulubiony_film':
          return `${acc} Ulubionym filmem ${name} jest ${value}.`;
        case 'ulubiony_kolor':
          return `${acc} Ulubionym kolorem ${name} jest ${value}.`;
        default:
          return `${acc} ${value}`;
      }
    }, '');
    return aboutMe;
  }

  private buildHash(info: People): string {
    return `${stringHash(JSON.stringify(info))}`;
  }

  private async indexData(qdrant: QdrantClient, data: People[]): Promise<Document[]> {
    const collectionInfo = await qdrant.getCollection(COLLECTION_NAME);
    // cache current file in current directory
    const embeddingsCache: EmbeddingCache = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'cache.json'), 'utf-8'));

    let documents: Document[] = [];
    // Index documents if not indexed
    if (!collectionInfo.points_count || collectionInfo.points_count < data.length) {
      console.log('Indexing data...');

      // Create documents with metadata
      documents = data.map(
        (info) =>
          new Document({
            pageContent: this.buildPageContent(info),
            metadata: { hash: this.buildHash(info), uuid: uuidv4(), source: COLLECTION_NAME },
          })
      );
      console.log('About me:', documents[0].pageContent);

      // Generate embeddings
      const points = [];
      for (const document of documents) {
        if (embeddingsCache[document.metadata.hash]) {
          points.push({
            id: document.metadata.uuid,
            payload: document.metadata,
            vector: embeddingsCache[document.metadata.hash],
          });
          continue;
        }
        const [embedding] = await embeddings.embedDocuments([document.pageContent]);
        points.push({
          id: document.metadata.uuid,
          payload: document.metadata,
          vector: embedding,
        });
        embeddingsCache[document.metadata.hash] = embedding;
        console.log('Document indexed:', document.metadata.hash);
      }
      fs.writeFileSync(path.resolve(__dirname, 'cache.json'), JSON.stringify(embeddingsCache, null, 2));

      // Index
      await qdrant.upsert(COLLECTION_NAME, {
        wait: true,
        batch: {
          ids: points.map((point) => point.id),
          vectors: points.map((point) => point.vector),
          payloads: points.map((point) => point.payload),
        },
      });
    } else {
      console.log('Data already indexed');
      documents = data.map(
        (info) =>
          new Document({
            pageContent: this.buildPageContent(info),
            metadata: { hash: this.buildHash(info), uuid: uuidv4(), source: COLLECTION_NAME },
          })
      );
    }
    return documents;
  }

  private async searchHash(qdrant: QdrantClient, question: string, limit: number): Promise<string[] | undefined> {
    const queryEmbedding = await embeddings.embedQuery(question);

    const people = await qdrant.search(COLLECTION_NAME, {
      vector: queryEmbedding,
      limit,
      filter: {
        must: [
          {
            key: 'source',
            match: {
              value: COLLECTION_NAME,
            },
          },
        ],
      },
    });

    console.log('People:', JSON.stringify(people, null, 2));

    return people.map((person) => person.payload.hash as string);
  }

  async solve(command: SolvePeopleCommand, task: SolvePeopleTask): Promise<SolvePeopleAnswer> {
    const people = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'people.json'), 'utf-8'));
    const data = people as People[];

    const qdrant = await this.initQdrant();

    const documents = await this.indexData(qdrant, data);

    const documentHashes = (await this.searchHash(qdrant, task.question, 3)) ?? [];

    const context = documents
      .filter((doc) => documentHashes.includes(doc.metadata.hash))
      .map((doc) => doc.pageContent)
      .join('\n###\n');

    console.log('Context to add:', context);

    const chatPrompt = ChatPromptTemplate.fromMessages([
      ['system', systemTemplate],
      ['human', humanTemplate],
    ]);

    const formattedChatPrompt = await chatPrompt.formatMessages({
      context,
      question: task.question,
    });

    const chat = new ChatOpenAI();
    const { content } = await chat.invoke(formattedChatPrompt);

    console.log('Content:', content);

    return { answer: content as string };
  }
}
