// features/results/components/SelfEvalBadge.tsx
import { IconCircle, IconMinus, IconTriangle, IconX } from '@tabler/icons-react';
import { SelfEvalType } from '@/shared/types/app.types';

export const SelfEvalBadge = ({ type, size = 18 }: { type: SelfEvalType; size?: number }) => {
  const props = { size, stroke: 2.5 };
  switch (type) {
    case 'CONFIDENT':
      return <IconCircle color="var(--mantine-color-teal-6)" {...props} />;
    case 'UNSURE':
      return <IconTriangle color="var(--mantine-color-orange-6)" {...props} />;
    case 'NONE':
      return <IconX color="var(--mantine-color-red-6)" {...props} />;
    default:
      return <IconMinus color="var(--mantine-color-gray-5)" {...props} />;
  }
};
