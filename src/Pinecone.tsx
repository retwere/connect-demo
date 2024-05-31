import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConnectPopup } from '@pinecone-database/connect';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';

function Pinecone() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [indexCreated, setIndexCreated] = useState<boolean>(false);

  const onCancel = useCallback(() => {
    setApiKey(null);
  }, []);

  const onConnect = useCallback(({key}: {key: string}) => {
    setApiKey(key);
  }, []);

  const popup = useMemo(
    () => ConnectPopup({onConnect, onCancel, integrationId: 'test'}),
    [onCancel, onConnect],
  );

  useEffect(() => () => popup.cleanup(), [popup])

  const createIndex = useCallback(async () => {
    if (!apiKey) throw new Error('No API key');
    if (indexCreated) return;
    const pc = new PineconeClient({apiKey});
    await pc.createIndex({
      name: 'test-index',
      dimension: 768,
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
  });
    setIndexCreated(true);
  }, [apiKey, indexCreated]);

  return (
    <div>
      <h2>Provision a Pinecone index</h2>
      <button onClick={popup.open} disabled={!!apiKey}>{apiKey ? 'Connected' : 'Connect to Pinecone'}</button>
      <button onClick={createIndex} disabled={!apiKey || indexCreated}>
        {indexCreated ? 'Index Created' : 'Create an Index'}
      </button>
    </div>
  );
}

export default Pinecone;