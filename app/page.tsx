'use client';

import { useEffect, useMemo, useState } from 'react';
import EntryGate from '@/components/providers/EntryGate';
import BgmToggle from '@/components/ui/BgmToggle';
import SceneController from '@/components/ui/SceneController';
import AdminPanel from '@/components/ui/AdminPanel';

import Cover from '@/components/chapters/Cover';
import Prelude from '@/components/chapters/Prelude';
import Meet from '@/components/chapters/Meet';
import Wedding from '@/components/chapters/Wedding';
import Baby from '@/components/chapters/Baby';
import Birthday from '@/components/chapters/Birthday';
import Finale from '@/components/chapters/Finale';

export default function Page() {
  const [entered, setEntered] = useState(false);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === '1') {
      setAdmin(true);
    }
  }, []);

  const scenes = useMemo(
    () => [
      {
        key: 'cover',
        label: 'Opening',
        title: '序幕',
        render: () => <Cover />,
      },
      {
        key: 'prelude',
        label: 'Prologue',
        title: '序章',
        render: (onComplete: () => void) => <Prelude onComplete={onComplete} />,
      },
      {
        key: 'meet',
        label: 'Chapter I',
        title: '初见',
        render: (onComplete: () => void) => <Meet onComplete={onComplete} />,
      },
      {
        key: 'wedding',
        label: 'Chapter II',
        title: '永结',
        render: (onComplete: () => void) => <Wedding onComplete={onComplete} />,
      },
      {
        key: 'baby',
        label: 'Chapter III',
        title: '初啼',
        render: (onComplete: () => void) => <Baby onComplete={onComplete} />,
      },
      {
        key: 'birthday',
        label: 'Chapter IV',
        title: '彤 · 芳华',
        render: () => <Birthday />,
      },
      {
        key: 'finale',
        label: 'Finale',
        title: '来日方长',
        render: () => <Finale />,
      },
    ],
    [],
  );

  return (
    <>
      {!entered && <EntryGate onEnter={() => setEntered(true)} />}
      {entered && (
        <>
          <BgmToggle autoplay={entered} />
          <SceneController scenes={scenes} />
        </>
      )}
      {admin && <AdminPanel onClose={() => setAdmin(false)} />}
    </>
  );
}
