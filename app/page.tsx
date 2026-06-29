'use client';

import { useState } from 'react';
import LenisProvider from '@/components/providers/LenisProvider';
import EntryGate from '@/components/providers/EntryGate';
import BgmToggle from '@/components/ui/BgmToggle';
import ScrollProgress from '@/components/ui/ScrollProgress';
import Petals from '@/components/ui/Petals';

import Cover from '@/components/chapters/Cover';
import Prelude from '@/components/chapters/Prelude';
import Meet from '@/components/chapters/Meet';
import Wedding from '@/components/chapters/Wedding';
import Baby from '@/components/chapters/Baby';
import Together from '@/components/chapters/Together';
import Birthday from '@/components/chapters/Birthday';
import Finale from '@/components/chapters/Finale';

export default function Page() {
  const [entered, setEntered] = useState(false);

  return (
    <>
      {!entered && <EntryGate onEnter={() => setEntered(true)} />}

      <LenisProvider enabled={entered}>
        <main className="relative">
          <ScrollProgress />
          <BgmToggle autoplay={entered} />
          <Petals />

          <Cover />
          <Prelude />
          <Meet />
          <Wedding />
          <Baby />
          <Together />
          <Birthday />
          <Finale />
        </main>
      </LenisProvider>
    </>
  );
}
