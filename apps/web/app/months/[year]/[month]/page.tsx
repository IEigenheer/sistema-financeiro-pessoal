import { MonthPage } from '../../../../components/month-page';

type Props = {
  params: Promise<{
    year: string;
    month: string;
  }>;
};

export default async function MonthRoute({ params }: Props) {
  const resolved = await params;
  return (
    <MonthPage
      year={Number(resolved.year)}
      month={Number(resolved.month)}
    />
  );
}
