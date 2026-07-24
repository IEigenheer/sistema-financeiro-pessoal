import { MonthsWorkspace } from '../../../../components/months-workspace';

type Props = {
  params: Promise<{
    year: string;
    month: string;
  }>;
};

export default async function MonthRoute({ params }: Props) {
  const resolved = await params;
  return <MonthsWorkspace initialYear={Number(resolved.year)} initialMonth={Number(resolved.month)} />;
}