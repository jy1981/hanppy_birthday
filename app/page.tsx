'use client';

import { useState } from 'react';
import EntryGate from '@/components/providers/EntryGate';
import BgmToggle from '@/components/ui/BgmToggle';
import SceneController from '@/components/ui/SceneController';

import Cover from '@/components/chapters/Cover';
import Prelude from '@/components/chapters/Prelude';
import Meet from '@/components/chapters/Meet';
import Wedding from '@/components/chapters/Wedding';
import Baby from '@/components/chapters/Baby';
import Birthday from '@/components/chapters/Birthday';
import Finale from '@/components/chapters/Finale';

export default function Page() {
  const [entered, setEntered] = useState(false);

  const scenes = [
    { key: 'cover', render: (onComplete: () => void) => <Cover onComplete={onComplete} /> },
    { key: 'prelude', render: (onComplete: () => void) => <Prelude onComplete={onComplete} /> },
    { key: 'meet', render: (onComplete: () => void) => <Meet onComplete={onComplete} /> },
    { key: 'wedding', render: (onComplete: () => void) => <Wedding onComplete={onComplete} /> },
    { key: 'baby', render: (onComplete: () => void) => <Baby onComplete={onComplete} /> },
    { key: 'birthday', render: (onComplete: () => void) => <Birthday onComplete={onComplete} /> },
    { key: 'finale', render: () => <Finale /> },
  ];

  return (
    <>
      {!entered && <EntryGate onEnter={() => setEntered(true)} />}
      {entered && (
        <>
          <BgmToggle autoplay={entered} />
          <SceneController scenes={scenes} />
        </>
      )}
    </>
  );
}
