import { Pinecone } from '@pinecone-database/pinecone'

type RequestBody = {
  apiKey?: string;
  name?: string;
}

export async function POST(request: Request) {
  const body = await request.json() as RequestBody;
  if (!body.apiKey) {
    return Response.json({ message: 'No API Key' }, { status: 400 });
  }
  const name = body.name || 'test-index';

  try {
    const pc = new Pinecone({apiKey: body.apiKey});
    const index = await pc.createIndex({
      name,
      dimension: 768,
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    })
    return Response.json(index);
  } catch (e) {
    const err = e as Error;
    return Response.json({ message: `Error creating index: ${err.toString()}` }, { status: 500 });
  }
}
