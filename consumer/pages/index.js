import Head from 'next/head';
import Vis from '../components/Vis.js';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
      </Head>
      <main>
        <Vis />
      </main>
    </div>
  );
}
