import { type IndexModel } from '@pinecone-database/pinecone'
import './App.css'
import { useCallback, useEffect, useState } from 'react'
import { ConnectPopup } from '@pinecone-database/connect'

function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [indexName, setIndexName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onCancel = useCallback(() => {
    console.log('Connection canceled')
    setApiKey(null)
  }, []);

  const onConnect = useCallback(({key}: {key: string}) => {
    console.log(`Connected to Pinecone with key: ${key}`);
    setApiKey(key);
  }, []);

  const [popup, setPopup] = useState<ReturnType<typeof ConnectPopup> | null>(null);

  useEffect(() => {
    console.log('Registering popup');
    const p = ConnectPopup({onConnect, onCancel, integrationId: 'test'});
    setPopup(p);
    return () => {
      console.log('Cleaning up popup');
      p.cleanup();
      setPopup(null);
    }
  }, [onConnect, onCancel])

  const createIndex = useCallback(async () => {
    if (!apiKey) throw new Error('No API Key');
    if (indexName) return;
    const res = await fetch('/api/create-index', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({apiKey}),
    })
    if (!res.ok) {
      const {message} = await res.json() as {message: string};
      setIndexName(null);
      setError(`Could not create index: ${message}`);
      return;
    }
    const index = await res.json() as IndexModel;
    setIndexName(index.name);
    setError(null);
  }, [apiKey, indexName]);

  return (
    <>
      <h1>Test Integration</h1>
      <p>
        This is a demonstration of the usage of the Pinecone Connect Popup in an example
        application. For the purposes of this demonstration, we will say that this application needs
        access to a newly-created Pinecone index.
      </p>
      <p>
        To solve this problem, we will use the Pinecone Connect Popup to connect to Pinecone and
        create an index.
      </p>

      <h2>Provision a Pinecone index</h2>
      <button onClick={popup?.open} disabled={!!apiKey}>
        {apiKey ? 'Connected' : 'Connect to Pinecone'}
      </button>
      <button onClick={() => {void createIndex()}} disabled={!apiKey || !!indexName}>
        {indexName ? 'Index Created' : 'Create an Index'}
      </button>

      <p>Once the index is created, it can be used throughout the rest of the application.</p>

      {indexName && <p>Index Created: {indexName}</p>}
      {error && <p>Error: {error}</p>}
    </>
  )
}

export default App
