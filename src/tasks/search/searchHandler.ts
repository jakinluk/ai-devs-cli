/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from '@langchain/openai';
import { v4 as uuidv4 } from 'uuid';
import { QdrantClient } from '@qdrant/js-client-rest';
import { BaseTaskHandler } from '../../core/handler/baseTaskHandler';
import { TaskDevClientProvider } from '../../core/clients/taskDevClient';
import * as config from '../config';
import { SolveSearchCommand } from '../commands';

const TASK_NAME = 'search';

const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });
const embeddings = new OpenAIEmbeddings({ maxConcurrency: 5 });

export class SolveSearchCommandHandlerProvider {
  async provide(): Promise<SolveSearchCommandHandler> {
    return new SolveSearchCommandHandler(
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
//   "msg": "Index all data from provided URL into vecto store and provide answer to my question - https://unknow.news/archiwum_aidevs.json",
//   "question": "Co różni pseudonimizację od anonimizowania danych?"
// }
type SolveSearchTask = {
  msg: string;
  question: string;
};

type SolveSearchAnswer = {
  answer: string;
};

type NewsItem = {
  title: string;
  url: string;
  info: string;
  date: string;
};

const COLLECTION_NAME = 'unknow_news3';

export class SolveSearchCommandHandler extends BaseTaskHandler<SolveSearchCommand, SolveSearchTask, SolveSearchAnswer> {
  private async initQdrant(): Promise<QdrantClient> {
    const result = await qdrant.getCollections();
    const indexed = result.collections.find((collection) => collection.name === COLLECTION_NAME);
    console.log(result);
    // Create collection if not exists
    if (!indexed) {
      await qdrant.createCollection(COLLECTION_NAME, { vectors: { size: 1536, distance: 'Cosine', on_disk: true } });
    }

    return qdrant;
  }

  private async indexData(qdrant: QdrantClient, data: NewsItem[]) {
    const collectionInfo = await qdrant.getCollection(COLLECTION_NAME);
    // Index documents if not indexed
    if (!collectionInfo.points_count) {
      console.log('Indexing data...');

      console.log('Data[0]:', JSON.stringify(data[0]));
      // Create documents with metadata
      const documents = data.map(
        (news) =>
          new Document({ pageContent: news.info, metadata: { url: news.url, uuid: uuidv4(), source: COLLECTION_NAME } })
      );
      documents.push(
        ...data.map(
          (news) =>
            new Document({
              pageContent: news.title,
              metadata: { url: news.url, uuid: uuidv4(), source: COLLECTION_NAME },
            })
        )
      );

      // Generate embeddings
      const points = [];
      for (const document of documents) {
        // TODO add embeddings caching!!!
        const [embedding] = await embeddings.embedDocuments([document.pageContent]);
        points.push({
          id: document.metadata.uuid,
          payload: document.metadata,
          vector: embedding,
        });
      }

      console.log('Points[0]:', JSON.stringify(points[0]));

      // Index
      await qdrant.upsert(COLLECTION_NAME, {
        wait: true,
        batch: {
          ids: points.map((point) => point.id),
          vectors: points.map((point) => point.vector),
          payloads: points.map((point) => point.payload),
        },
      });
    }
  }

  private async searchSourceUrl(qdrant: QdrantClient, question: string): Promise<string | undefined> {
    const queryEmbedding = await embeddings.embedQuery(question);

    const search = await qdrant.search(COLLECTION_NAME, {
      vector: queryEmbedding,
      limit: 1,
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

    console.log('Search:', JSON.stringify(search, null, 2));

    return search[0]?.payload?.url as string;
  }

  async solve(command: SolveSearchCommand, task: SolveSearchTask): Promise<SolveSearchAnswer> {
    const urlToFetch = task.msg.split(' - ')[1];
    const newsJson = await fetch(urlToFetch);
    const data = (await newsJson.json()) as NewsItem[];

    const qdrant = await this.initQdrant();

    await this.indexData(qdrant, data);

    const sourceUrl = await this.searchSourceUrl(qdrant, task.question);

    console.log('Source URL:', sourceUrl);

    return { answer: sourceUrl };
  }
}
