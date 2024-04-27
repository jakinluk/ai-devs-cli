/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { SolveMemeCommand } from '../commands';
import * as config from '../config';
import { TaskDevClientProvider } from '../../core/clients/taskDevClient';
import { BaseTaskHandler } from '../../core/handler/baseTaskHandler';

const TASK_NAME = 'meme';

export class SolveMemeCommandHandlerProvider {
  async provide(): Promise<SolveMemeCommandHandler> {
    return new SolveMemeCommandHandler(
      await new TaskDevClientProvider().provide({
        baseUrl: config.baseConfig.BASE_URL,
        apiKey: config.baseConfig.API_KEY,
      }),
      TASK_NAME
    );
  }
}

// Obtained task
//  {
//   "code": 0,
//   "msg": "Create meme using RednerForm API and send me the URL to JPG via /answer/ endpoint",
//   "service": "https://renderform.io/",
//   "image": "https://tasks.aidevs.pl/data/monkey.png",
//   "text": "Gdy koledzy z pracy mówią, że ta cała automatyzacja to tylko chwilowa moda, a Ty właśnie zastąpiłeś ich jednym, prostym skryptem",
//   "hint": "https://tasks.aidevs.pl/hint/meme"
// }
type SolveMemeTask = {
  text: string;
  image: string;
};

type SolveMemeAnswer = {
  answer: string;
};

const RENDER_FORM_API = 'https://get.renderform.io/';

// {
//   "template": "template_1234",
//   "data": {
//     "my-text.text": "John"
//   },
//   "fileName": "my-file-name",
//   "webhookUrl": "https://my-webhook.com",
//   "version": "my-cache-key",
//   "metadata": {
//     "my-text.text": "John"
//   },
//   "batchName": "my-batch-name"
// }
type RenderFormPayload = {
  template: string;
  data: Record<string, unknown>;
};

type RenderFormResponse = {
  href: string;
};

export class SolveMemeCommandHandler extends BaseTaskHandler<SolveMemeCommand, SolveMemeTask, SolveMemeAnswer> {
  async solve(command: SolveMemeCommand, task: SolveMemeTask): Promise<SolveMemeAnswer> {
    const { text, image } = task;
    const imgUrl = await this.renderMeme(text, image);

    return { answer: imgUrl };
  }

  private async renderMeme(text: string, imageSrc: string): Promise<string> {
    console.log('Rendering meme...');
    const renderFormPayload: RenderFormPayload = {
      template: 'fearless-tigers-rumble-shyly-1599',
      data: {
        'meme-text.text': text,
        'meme-image.src': imageSrc,
      },
    };
    const result = await fetch(`${RENDER_FORM_API}api/v2/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.RENDER_FORM_API_KEY,
      },
      body: JSON.stringify(renderFormPayload),
    });
    const { href } = (await result.json()) as RenderFormResponse;
    console.log('Meme created:', href);
    return href;
  }
}
