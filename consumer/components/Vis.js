import dynamic from 'next/dynamic';

const Vitessce = dynamic(() => import('./VitessceWrapper'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

const eng2019 = {
  name: 'Eng et al., Nature 2019',
  version: '1.0.16',
  description: '',
  datasets: [],
  initStrategy: 'auto',
  coordinationSpace: { },
  layout: [
    {
      component: 'description',
      props: {
        description: 'Transcriptome-scale super-resolved imaging in tissues by RNA seqFISH',
      },
      x: 9,
      y: 0,
      w: 3,
      h: 2,
    },
  ],
};

export default function Vis() {
  return (
    <Vitessce config={eng2019} theme="light" height={500} />
  );
}
